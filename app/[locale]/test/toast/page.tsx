"use client";

import toast from "react-hot-toast";
export default function page() {
  return (
    <div>
        <button
            onClick={() => toast.success("Hello NexCampus!")}
        >
            Test Toast
        </button>
    </div>
  )
}
