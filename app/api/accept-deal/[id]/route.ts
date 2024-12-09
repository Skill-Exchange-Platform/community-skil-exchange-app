import { NextRequest, NextResponse } from 'next/server';
import db from "@/lib/db"; // Ensure you have a database connection utility
import Conversation from "@/models/Conversation"; // Import your Conversation model
import { Server } from "socket.io";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
let io;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await db();
  const { id } = params; // Get deal ID from URL

  const { searchParams } = new URL(req.url);
  const providerEmail = searchParams.get('providerEmail');
  const providerName = searchParams.get('providerName');
  const seekerEmail = searchParams.get('seekerEmail');
  const seekerName = searchParams.get('seekerName');
  const seekerId = searchParams.get('seekerId'); // Get seekerId from query params

  // Validate required parameters
  if (!providerEmail || !providerName || !seekerEmail || !seekerName || !seekerId) {
    return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
  }

  // Initialize Socket.IO if not already done
  if (!io) {
    io = new Server({
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  try {
    // Create or update the conversation in the database
    const conversation = await Conversation.findOneAndUpdate(
      {
        $or: [
          { providerId: seekerId, seekerId: id },
          { providerId: id, seekerId: seekerId },
        ],
      },
      {
        $setOnInsert: {
          providerId: id,
          seekerId: seekerId,
        },
        $push: {
          messages: {
            senderId: seekerId,
            content: `${providerName} has accepted your deal.`,
            timestamp: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    // Emit deal accepted event to both users
    io.to(providerEmail).emit("deal_accepted", { providerEmail, providerName, seekerEmail, seekerName });
    io.to(seekerEmail).emit("deal_accepted", { providerEmail, providerName, seekerEmail, seekerName });

    return NextResponse.redirect(`${BASE_URL}/chat?providerEmail=${providerEmail}&providerName=${providerName}&seekerEmail=${seekerEmail}&seekerName=${seekerName}&id=${id}`);
  } catch (error) {
    console.error("Error creating or updating conversation:", error);
    return NextResponse.json({ success: false, error: "Error handling conversation" }, { status: 500 });
  }
}
