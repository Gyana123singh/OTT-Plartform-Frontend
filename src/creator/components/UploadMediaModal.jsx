import React, { useState } from 'react';
import BaseModal from '../../components/modals/BaseModal';
import FileSelect from './upload-steps/FileSelect';
import VideoDetails from './upload-steps/VideoDetails';
import UploadVisibility from './upload-steps/UploadVisibility';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadVideo } from '../../services/api';

const STEPS = [
  { id: 'select', label: 'Select' },
  { id: 'details', label: 'Details' },
  { id: 'visibility', label: 'Visibility' },
];

const UploadMediaModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadData, setUploadData] = useState({
    video: null,
    thumbnail: null,
    title: "",
    description: "",
    category: "Entertainment",
    tags: ""
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', uploadData.video);
      formData.append('thumbnail', uploadData.thumbnail);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('tags', uploadData.tags);

      await uploadVideo(formData, (progress) => {
        setUploadProgress(progress);
      });
      alert("Video uploaded successfully!");
      onClose();
      setCurrentStep(0);
      setUploadData({
        video: null,
        thumbnail: null,
        title: "",
        description: "",
        category: "Entertainment",
        tags: ""
      });
    } catch (error) {
      console.error("Upload Error:", error);
      const message = error.response?.data?.message || "Failed to upload video. Please check your connection and try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const updateData = (newData) => {
    setUploadData(prev => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'select': return <FileSelect onNext={handleNext} updateData={updateData} data={uploadData} />;
      case 'details': return <VideoDetails onNext={handleNext} updateData={updateData} data={uploadData} />;
      case 'visibility': return <UploadVisibility onPublish={handlePublish} loading={loading} progress={uploadProgress} />;
      default: return null;
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={() => {
        if (!loading) {
          onClose();
          setTimeout(() => setCurrentStep(0), 300);
        }
      }} 
      title={currentStep === 0 ? "Upload Video" : `Upload: ${STEPS[currentStep].label}`}
      maxWidth={currentStep === 0 ? "max-w-3xl" : "max-w-6xl"}
    >
      <div className="space-y-8 md:space-y-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center max-w-lg mx-auto px-4 md:px-0">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 relative">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all duration-500
                  ${i <= currentStep ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                  {i + 1}
                </div>
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest absolute -bottom-5 md:-bottom-6 whitespace-nowrap transition-all duration-500
                  ${i <= currentStep ? 'text-white' : 'text-slate-600'}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 md:mx-4 bg-white/5 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: i < currentStep ? '100%' : '0%' }}
                    className="absolute inset-0 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="pt-8 md:pt-6 min-h-[300px] md:min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BaseModal>
  );
};

export default UploadMediaModal;
