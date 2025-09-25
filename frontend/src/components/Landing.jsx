import { useState } from "react";
import AuthModal from "../components/AuthModal";

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
          {/* Left */}
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-normal text-white">
              Discover & Register <br /> for College Events
            </h1>
            <p className="text-xl leading-relaxed tracking-tight text-gray-300 max-w-md text-left">
              Cultural fests, hackathons, workshops, fun activities, speaker
              sessions — all in one place.
            </p>
            <p className="text-lg text-gray-300 max-w-md text-left mt-4">
              Ready to join and participate? Get started today!
            </p>
            <div className="flex flex-row gap-4 mt-6">
            <button
                className="px-6 py-3 text-black !bg-white rounded-lg transition"
                onClick={() => setIsModalOpen(true)}
            >
                Get Started
            </button>

            </div>
          </div>

          {/* Right */}
          <div
            className="bg-contain bg-center bg-no-repeat rounded-md aspect-square"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/originals/cd/48/19/cd4819ed5c27a25ef7023d643de3e393.jpg')",
            }}
          ></div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
    </div>
  );
}

export default Landing;
