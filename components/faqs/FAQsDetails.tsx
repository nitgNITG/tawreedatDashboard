"use client";
import React, { useEffect } from "react";
import FaqCard from "./FaqCard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setFaqs } from "@/redux/reducers/faqsReducer";

const FAQsDetails = ({
  faqs = [],
}: {
  faqs?: { id: number; question: string; answer: string }[];
}) => {
  const faqsData = useAppSelector((state) => state.faqs.faqs) || faqs || [];
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (faqs.length > 0) {
      dispatch(setFaqs(faqs));
    }
  }, [faqs, dispatch]);

  return (
    <div className="space-y-5">
      {faqsData.length > 0 ? (
        faqsData.map((aq: { id: number; question: string; answer: string }) => (
          <FaqCard key={aq.id} id={aq.id} que={aq.question} ans={aq.answer} />
        ))
      ) : (
        <p className="text-center text-gray-500">No FAQs available.</p>
      )}
    </div>
  );
};

export default FAQsDetails;
