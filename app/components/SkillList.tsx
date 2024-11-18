"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SkillCard from "./SkillCard";
import { setSelectedCategory } from "@/lib/features/skills/categorySlice"; 
import { RootState } from "@/lib/store";  // Adjust path if needed

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  photo: string;
}

const SkillsList: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const selectedCategory = useSelector((state: RootState) => state.category.selectedCategory);
  const categories = useSelector((state: RootState) => state.category.categories);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/skills/");
        const result = await response.json();

        if (result.success) {
          setSkills(result.data);
        } else {
          console.error("Failed to fetch skills");
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = selectedCategory
    ? skills.filter((skill) => skill.category === selectedCategory)
    : skills;
    const displayedSkills = filteredSkills.slice(0, 4);
  return (
    <div className="container bg-white mx-auto lg:px-2 py-6">
      <div className="flex justify-center space-x-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === category
                ? "bg-orange text-white"
                : "bg-beige text-brown"
            }`}
            onClick={() => dispatch(setSelectedCategory(category))}
          >
            {category}
          </button>
        ))}
        <button
          className={`px-4 py-2 rounded-lg ${
            !selectedCategory
              ? "bg-orange text-white"
              : "bg-beige text-brown"
          }`}
          onClick={() => dispatch(setSelectedCategory(""))}
        >
          All
        </button>
      </div>

      <div className="overflow-x-auto flex justify-center whitespace-nowrap">
        <div className="flex gap-6">
          {displayedSkills.map((skill) => (
            <SkillCard
              key={skill._id}
              imageSrc={skill.photo || "no photo"}
              title={skill.title}
              category={skill.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsList;
