import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { supabase } from '../lib/supabase';
import { ChakraType } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Music, Video, FileText, Image, BookOpen, Info, AlertCircle } from 'lucide-react';
import TattooButton from '../components/ui/TattooButton';
import SacredHeading from '../components/ui/SacredHeading';
import ChakraSelector from '../components/ui/ChakraSelector';
import FloatingFormulas from '../components/ui/FloatingFormulas';

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const { chakraState, activateChakra } = useChakra();
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'audio' | 'video' | 'pdf' | 'image' | 'text'>('audio');
  const [chakra, setChakra] = useState<ChakraType>(chakraState.type);
  const [timeline, setTimeline] = useState<'past' | 'present' | 'future'>('present');
  const [frequency, setFrequency] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [ritualLink, setRitualLink] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    
    // Determine media type from file
    if (file.type.startsWith('audio/')) {
      setMediaType('audio');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type === 'application/pdf') {
      setMediaType('pdf');
    } else if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else {
      setMediaType('text');
    }
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleUpload = async () => {
    if (!user || !selectedFile) return;
    
    // Validate form
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // In a real app, this would upload to Supabase Storage
      // const filePath = `sacred-library/${user.id}/${Date.now()}_${selectedFile.name}`;
      // const { data, error } = await supabase.storage
      //   .from('sacred-library')
      //   .upload(filePath, selectedFile, {
      //     cacheControl: '3600',
      //     upsert: false
      //   });
      
      // if (error) throw error;
      
      // Then create a record in the sacred_library_items table
      // const { data: itemData, error: itemError } = await supabase
      //   .from('sacred_library_items')
      //   .insert([
      //     {
      //       title,
      //       description,
      //       file_url: filePath,
      //       creator_id: user.id,
      //       chakra,
      //       timeline,
      //       frequency_hz: frequency ? parseInt(frequency) : null,
      //       tags,
      //       media_type: mediaType,
      //       is_locked: false
      //     }
      //   ])
      //   .select()
      //   .single();
      
      // if (itemError) throw itemError;
      
      // For demo, simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate upload completion
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Determine if this should go to moderation
      if (showModeration) {
        // In a real app, insert into sacred_library_upload_requests
        setSuccess('Your upload has been submitted for moderation. You will be notified when it is approved.');
      } else {
        // In a real app, insert into sacred_library_items
        setSuccess('Your content has been successfully uploaded to the Sacred Library!');
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setFilePreview(null);
        setTitle('');
        setDescription('');
        setMediaType('audio');
        setChakra(chakraState.type);
        setTimeline('present');
        setFrequency('');
        setTags([]);
        setTagInput('');
        setRitualLink('');
        setUploadProgress(0);
        setIsUploading(false);
        setSuccess(null);
        
        // Navigate back to library
        navigate('/sacred-library');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };
  
  // Get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch(type) {
      case 'audio': return <Music size={24} />;
      case 'video': return <Video size={24} />;
      case 'pdf': return <FileText size={24} />;
      case 'image': return <Image size={24} />;
      case 'text': return <BookOpen size={24} />;
      default: return <BookOpen size={24} />;
    }
  };
  
  // Check if frequency is a Tesla number (3, 6, 9)
  const isTeslaNumber = (frequency: string): boolean => {
    return frequency.includes('3') || frequency.includes('6') || frequency.includes('9');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/sacred-library')}
          className="mr-3 p-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <SacredHeading 
          as="h1" 
          className="text-2xl"
          chakraColor={chakraState.color}
          withGlow
        >
          Upload to Sacred Library
        </SacredHeading>
      </div>
      
      {error && (
        <motion.div 
          className="mb-6 p-4 bg-red-900 text-red-100 rounded-2xl flex items-start"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          className="mb-6 p-4 rounded-2xl flex items-start"
          style={{ 
            backgroundColor: `${chakraState.color}20`,
            color: chakraState.color
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Info size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </motion.div>
      )}
      
      <div className="bg-dark-200 p-6 rounded-2xl border border-dark-300 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <FloatingFormulas density="low" />
        </div>
        
        {/* File upload area */}
        <div className="mb-6 relative z-10">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select File
          </label>
          
          {selectedFile ? (
            <div className="border border-dark-400 rounded-lg p-4 bg-dark-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getMediaTypeIcon(mediaType)}
                  <span className="ml-2 text-white">{selectedFile.name}</span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {mediaType.toUpperCase()}
              </div>
              
              {filePreview && (
                <div className="mt-3 flex justify-center">
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="max-h-40 rounded"
                  />
                </div>
              )}
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-dark-400 rounded-lg p-8 text-center cursor-pointer hover:border-dark-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">Click to select or drag and drop</p>
              <p className="text-sm text-gray-400">
                Supports audio, video, PDF, images, and text files
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="audio/*,video/*,application/pdf,image/*,text/*"
              />
            </div>
          )}
        </div>
        
        {/* Form fields */}
        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
              placeholder="Enter a title for your content"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
              placeholder="Describe your content"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Media Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['audio', 'video', 'pdf', 'image', 'text'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMediaType(type)}
                  className={`p-3 rounded-lg flex flex-col items-center ${
                    mediaType === type
                      ? 'bg-dark-100 ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    ringColor: mediaType === type ? chakraState.color : undefined
                  }}
                >
                  {getMediaTypeIcon(type)}
                  <span className="mt-1 text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chakra Alignment
            </label>
            <ChakraSelector 
              value={chakra}
              onChange={(chakra) => {
                setChakra(chakra);
                activateChakra(chakra);
              }}
              layout="grid"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timeline Focus
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['past', 'present', 'future'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeline(t)}
                  className={`p-3 rounded-lg text-center ${
                    timeline === t
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: timeline === t 
                      ? t === 'past' ? '#C6282820' : 
                        t === 'present' ? '#66BB6A20' : 
                        '#AB47BC20'
                      : undefined,
                    color: timeline === t 
                      ? t === 'past' ? '#C62828' : 
                        t === 'present' ? '#66BB6A' : 
                        '#AB47BC'
                      : 'white',
                    ringColor: timeline === t 
                      ? t === 'past' ? '#C62828' : 
                        t === 'present' ? '#66BB6A' : 
                        '#AB47BC'
                      : undefined
                  }}
                >
                  <div className="font-medium capitalize">
                    {t}
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {t === 'past' ? 'Ancestral wisdom' : 
                     t === 'present' ? 'Current reality' : 
                     'Future potential'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tesla Frequency (Hz)
            </label>
            <div className="grid grid-cols-7 gap-2">
              {[396, 417, 528, 639, 741, 852, 963].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq.toString())}
                  className={`p-2 rounded-lg text-center ${
                    frequency === freq.toString()
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: frequency === freq.toString() ? `${chakraState.color}20` : undefined,
                    ringColor: frequency === freq.toString() ? chakraState.color : undefined
                  }}
                >
                  <div className="font-medium">{freq}</div>
                  <div className="text-xs mt-0.5 opacity-80">Hz</div>
                </button>
              ))}
            </div>
            
            <div className="mt-2">
              <input
                type="text"
                value={frequency}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFrequency(value);
                }}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Custom frequency (Hz)"
              />
              
              {frequency && isTeslaNumber(frequency) && (
                <motion.div 
                  className="mt-2 text-sm px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: `${chakraState.color}20`,
                    color: chakraState.color
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 0 3px ${chakraState.color}`,
                      `0 0 6px ${chakraState.color}`,
                      `0 0 9px ${chakraState.color}`
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Tesla 3-6-9 frequency detected! This will enhance resonance.
                </motion.div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ritual Link (Optional)
            </label>
            <select
              value={ritualLink}
              onChange={(e) => setRitualLink(e.target.value)}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
              style={{ focusRingColor: chakraState.color }}
            >
              <option value="">No ritual required</option>
              <option value="the-fool">The Fool Journey</option>
              <option value="the-high-priestess">High Priestess Journey</option>
              <option value="the-empress">The Empress Journey</option>
              <option value="the-hierophant">The Hierophant Journey</option>
              <option value="heart-resonance">Heart Resonance Ritual</option>
            </select>
            
            {ritualLink && (
              <div className="mt-2 text-sm text-gray-400">
                This content will be locked until the user completes the selected ritual.
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-l-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
                placeholder="Add tags and press Enter"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-dark-400 text-white rounded-r-md"
              >
                Add
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <div 
                    key={tag} 
                    className="flex items-center px-2 py-1 text-xs rounded-full bg-dark-300 text-gray-300"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="moderation"
              checked={showModeration}
              onChange={(e) => setShowModeration(e.target.checked)}
              className="h-4 w-4 rounded border-dark-400 bg-dark-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="moderation" className="ml-2 text-sm text-gray-300">
              Submit for moderation (required for public content)
            </label>
          </div>
          
          {/* Upload progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Uploading...</span>
                <span className="text-white">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-dark-300 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full"
                  style={{ backgroundColor: chakraState.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end">
            <TattooButton
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || isUploading}
              chakraColor={chakraState.color}
            >
              {isUploading ? (
                <>
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-1"
                  >
                    ⟳
                  </motion.span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-1" />
                  Upload to Library
                </>
              )}
            </TattooButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;