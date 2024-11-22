"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchSkillById } from "@/lib/features/skills/skillsSlice";
import {
  getReviewsBySkillId,
  createReview,
} from "@/lib/features/reviews/reviewSlice";
import avatar from "@/app/public/avatar.jpg";
import Image from "next/image";
import loading2 from '@/app/public/loading2.gif';

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  photo?: string;
  user: {
    name?: string;
    email?: string;
    country: string;
    bio?: string;
    photo?: string;
  };
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
}

interface Review {
  rating: number;
  comment: string;
  user: {
    name: string;
    // reviewedBy:[]
  };
}

const SkillCardDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false); 


  useEffect(() => {
    if (id) {
      dispatch(fetchSkillById(id))
        .unwrap()
        .then((response) => {
          if (response.success) {
            setSkill(response.data);
          } else {
            console.error("Failed to fetch skill:", response.message);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch skill:", error);
          alert("An error occurred while fetching skill details.");
          setLoading(false);
        });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id) {
      dispatch(getReviewsBySkillId(id))
        .unwrap()
        .then((reviews) => {
          setReviews(reviews); 
        })
        .catch((error) => {
          console.error("Failed to fetch reviews:", error);
          alert("An error occurred while fetching reviews details.");
        });
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center bg-white items-center h-screen">
        <Image src={loading2} alt="Loading..." width={250} height={250} />
      </div>
    );
  }

  if (!skill) {
    return <p className="text-center">Skill not found.</p>;
  }

  const handleReviewSubmit = () => {
    const review = {
      skillId: skill._id,
      userId: id, 
      rating,
      comment: newReview,
      reviewedBy: "6717e35a47d471bd744d4cf0",
    };

    dispatch(createReview(review))
      .unwrap()
      .then((response) => {
        if (response.success) {
          setReviews([...reviews, response.data]);
          setNewReview("");
          setRating(0);
        } else {
          console.error("Failed to create review:", response.message);
        }
      })
      .catch((error) => {
        console.error("Failed to create review:", error);
        alert("An error occurred while creating the review.");
      });
  };

  return (
    <div className="bg-neutral-50 shadow-lg rounded-lg p-6 mx-auto w-full h-full lg:flex lg:gap-6">
      {/* Left Side: Skill Details */}
      <div className="lg:w-2/3">
        {/* Header Image */}
        <div className="relative">
          <img
            src={skill.photo || avatar}
            alt={skill.title}
            className="w-full h-48 object-cover rounded-t-lg lg:rounded-lg"
          />
        </div>
        {/* Skill Information */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-brown">{skill.title}</h2>
          <p className="text-sm text-brown mt-2">{skill.description}</p>
          <p className="text-sm text-gray mt-4">
            <strong className="text-brown">Category:</strong> {skill.category}
          </p>
        </div>
        {/* Skill Provider Information */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-4">
            <img
              src={skill.user.photo || avatar}
              alt={skill.user.name || "User Avatar"}
              className="w-12 h-12 cursor-pointer rounded-full"
            />
            <div>
              <p className="text-sm cursor-pointer font-medium text-gray">
                {skill.user.name || "Anonymous"}
              </p>
              <p className="text-xs text-gray">{skill.user.country}</p>
              <p className="text-xs text-gray">{skill.user.email}</p>
            </div>
          </div>
         
        </div>
        {/* Review Section */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-brown">Give a Review</h3>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray"}`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="w-full mt-2 p-2 border bg-white rounded-lg text-sm text-gray-700"
            placeholder="Thank you for your great review!"
          ></textarea>
          <button
            onClick={handleReviewSubmit}
            className="mt-2 w-full bg-orange text-white py-2 px-4 rounded-lg hover:bg-blue-600 lg:w-auto lg:px-6"
          >
            Submit
          </button>

        {/* Display Reviews */}
        {reviews.slice(0, showAllReviews ? reviews.length : 5).map((review, index) => (
                        <div key={index} className="border-b py-2">
                            <p><strong className="text-brown">User:</strong> {review.user.name || "Anonymous"}</p>
                            <p className="text-yellow-500"><strong className="text-brown">Rating:</strong> {"★".repeat(review.rating)} {"☆".repeat(5 - review.rating)}</p>
                            <p className="text-black">{review.comments}</p>
                        </div>
                    ))}

                    {/* See More Button */}
                    {reviews.length > 5 && !showAllReviews && (
                        <button onClick={() => setShowAllReviews(true)} className="mt-2 text-orange hover:underline">
                            See More
                        </button>
                    )}
                    
                    {/* See Less Button */}
                    {showAllReviews && (
                        <button onClick={() => setShowAllReviews(false)} className="mt-2 text-orange hover:underline">
                            See Less
                        </button>
                    )}
                </div>
            </div>

      {/* Right Side: User & Call to Action */}
      <div className="lg:w-1/3 bg-gray-100 rounded-lg p-6">
        {/* Call to Action */}
        <div className="mt-2">
          <h3 className="text-lg font-semibold text-brown">
            Interested in this skill?
          </h3>
          <button className="mt-4 w-full bg-blue text-white py-2 px-4 rounded-lg hover:bg-blue-600 lg:px-6">
            Start a Conversation
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center mx-4 mt-6 gap-4">
          <img src={avatar} alt="App User" className="w-12 h-12 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-800">Your Name</p>
            <p className="text-xs text-gray-500">Your Location</p>
            {/* <p className="mt-2 text-sm text-black">Bio </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCardDetails;