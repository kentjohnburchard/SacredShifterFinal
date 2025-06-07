import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useChakra } from '../../context/ChakraContext';
import { Settings, Pin, Shield, Edit, Users, Eye, EyeOff, Trash2 } from 'lucide-react';
import TattooButton from '../ui/TattooButton';
import { sharedSigilBoardData, ritualArchetypes } from '../../data/sacredCircleData';

interface CircleModerationProps {
  circleId: string;
  isCreator: boolean;
  className?: string;
}

const CircleModeration: React.FC<CircleModerationProps> = ({
  circleId,
  isCreator,
  className = ''
}) => {
  const { user } = useAuth();
  const { chakraState } = useChakra();
  
  const [activeTab, setActiveTab] = useState<'featured' | 'roles' | 'settings'>('featured');
  const [featuredSigils, setFeaturedSigils] = useState<string[]>([sharedSigilBoardData[0].sigilId, sharedSigilBoardData[2].sigilId]);
  const [circleTone, setCircleTone] = useState<'introspective' | 'celebratory' | 'initiation'>('introspective');
  const [featuredRitual, setFeaturedRitual] = useState(ritualArchetypes[0].id);
  const [isEditing, setIsEditing] = useState(false);
  
  // If not creator, show limited view
  if (!isCreator) {
    return (
      <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
        <div className="flex items-center mb-4">
          <Shield size={18} className="mr-2 text-gray-400" />
          <h3 className="text-lg font-medium text-white">Circle Moderation</h3>
        </div>
        
        <div className="text-center py-6">
          <Shield size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-300 mb-2">Only circle creators can access moderation tools.</p>
          <p className="text-sm text-gray-400">
            Contact the circle creator if you need to suggest changes or have moderation concerns.
          </p>
        </div>
      </div>
    );
  }
  
  // Get sigil by ID
  const getSigilById = (id: string) => {
    return sharedSigilBoardData.find(s => s.sigilId === id);
  };
  
  // Get ritual by ID
  const getRitualById = (id: string) => {
    return ritualArchetypes.find(r => r.id === id);
  };
  
  // Toggle featured sigil
  const toggleFeaturedSigil = (sigilId: string) => {
    if (featuredSigils.includes(sigilId)) {
      setFeaturedSigils(featuredSigils.filter(id => id !== sigilId));
    } else {
      setFeaturedSigils([...featuredSigils, sigilId]);
    }
  };
  
  // Get chakra color
  const getChakraColor = (chakra: string): string => {
    const chakraColors: Record<string, string> = {
      Root: 'var(--chakra-root)',
      Sacral: 'var(--chakra-sacral)',
      SolarPlexus: 'var(--chakra-solarplexus)',
      Heart: 'var(--chakra-heart)',
      Throat: 'var(--chakra-throat)',
      ThirdEye: 'var(--chakra-thirdeye)',
      Crown: 'var(--chakra-crown)'
    };
    
    return chakraColors[chakra] || chakraState.color;
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'featured':
        return (
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Circle Tone</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCircleTone('introspective')}
                  className={`p-2 rounded-lg text-center ${
                    circleTone === 'introspective'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: circleTone === 'introspective' ? `${chakraState.color}20` : undefined,
                    ringColor: circleTone === 'introspective' ? chakraState.color : undefined
                  }}
                >
                  <div className="text-sm font-medium text-white">Introspective</div>
                </button>
                
                <button
                  onClick={() => setCircleTone('celebratory')}
                  className={`p-2 rounded-lg text-center ${
                    circleTone === 'celebratory'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: circleTone === 'celebratory' ? `${chakraState.color}20` : undefined,
                    ringColor: circleTone === 'celebratory' ? chakraState.color : undefined
                  }}
                >
                  <div className="text-sm font-medium text-white">Celebratory</div>
                </button>
                
                <button
                  onClick={() => setCircleTone('initiation')}
                  className={`p-2 rounded-lg text-center ${
                    circleTone === 'initiation'
                      ? 'ring-2'
                      : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  style={{
                    backgroundColor: circleTone === 'initiation' ? `${chakraState.color}20` : undefined,
                    ringColor: circleTone === 'initiation' ? chakraState.color : undefined
                  }}
                >
                  <div className="text-sm font-medium text-white">Initiation</div>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Featured Ritual</h4>
              <select
                value={featuredRitual}
                onChange={(e) => setFeaturedRitual(e.target.value)}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2"
                style={{ focusRingColor: chakraState.color }}
              >
                {ritualArchetypes.map(ritual => (
                  <option key={ritual.id} value={ritual.id}>
                    {ritual.name}
                  </option>
                ))}
              </select>
              
              {/* Featured ritual preview */}
              {getRitualById(featuredRitual) && (
                <div className="mt-2 p-3 rounded-lg bg-dark-300">
                  <div className="flex items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: `${getChakraColor(getRitualById(featuredRitual)?.primaryChakra || 'Heart')}20`
                      }}
                    >
                      {getRitualById(featuredRitual)?.primaryChakra.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-white">{getRitualById(featuredRitual)?.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{getRitualById(featuredRitual)?.description}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-white">Featured Sigils</h4>
                <div className="text-xs text-gray-400">{featuredSigils.length} selected</div>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {sharedSigilBoardData.map(sigil => (
                  <div 
                    key={sigil.sigilId}
                    className={`p-2 rounded-lg flex items-center ${
                      featuredSigils.includes(sigil.sigilId)
                        ? 'bg-dark-100 ring-1'
                        : 'bg-dark-300'
                    }`}
                    style={{
                      ringColor: featuredSigils.includes(sigil.sigilId) ? chakraState.color : undefined
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                      style={{ 
                        backgroundColor: `${getChakraColor(sigil.chakra)}20`
                      }}
                    >
                      {sigil.chakra.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm text-white">{sigil.intention}</div>
                      <div className="text-xs text-gray-400">{sigil.chakra} • {sigil.timeline}</div>
                    </div>
                    
                    <button
                      onClick={() => toggleFeaturedSigil(sigil.sigilId)}
                      className={`p-1.5 rounded-full ${
                        featuredSigils.includes(sigil.sigilId)
                          ? 'bg-dark-300 text-white'
                          : 'bg-dark-400 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Pin size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'roles':
        return (
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Circle Roles</h4>
              <p className="text-xs text-gray-400 mb-4">
                Assign special roles to circle members to delegate moderation tasks.
              </p>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {circleMembersData.slice(0, 5).map(member => (
                  <div 
                    key={member.id}
                    className="p-2 rounded-lg bg-dark-300 flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img 
                        src={member.avatarUrl} 
                        alt={member.displayName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm text-white">{member.displayName}</div>
                      <div className="text-xs text-gray-400">Level {member.xpLevel}</div>
                    </div>
                    
                    <select
                      className="bg-dark-400 border-none text-gray-300 text-xs rounded-md focus:outline-none focus:ring-2 py-1 px-2"
                      style={{ focusRingColor: chakraState.color }}
                      defaultValue={member.id === user?.id ? 'creator' : 'member'}
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="ritual-leader">Ritual Leader</option>
                      <option value="creator" disabled={member.id !== user?.id}>Creator</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Role Permissions</h4>
              
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-dark-300">
                  <div className="text-sm font-medium text-white mb-1">Moderator</div>
                  <div className="text-xs text-gray-400">
                    Can pin sigils, moderate messages, and schedule rituals
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-dark-300">
                  <div className="text-sm font-medium text-white mb-1">Ritual Leader</div>
                  <div className="text-xs text-gray-400">
                    Can create and lead rituals, activate sigils
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-dark-300">
                  <div className="text-sm font-medium text-white mb-1">Member</div>
                  <div className="text-xs text-gray-400">
                    Can participate in rituals, send messages, and contribute sigils
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Circle Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Circle Name</label>
                  <input
                    type="text"
                    defaultValue="Heart Resonance Circle"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-70"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Circle Description</label>
                  <textarea
                    defaultValue="A sacred space for heart-centered connection and collective resonance."
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-70"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Circle Image URL</label>
                  <input
                    type="text"
                    defaultValue="https://example.com/circle-image.jpg"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-70"
                    style={{ focusRingColor: chakraState.color }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Circle Visibility</label>
                    <select
                      disabled={!isEditing}
                      className="bg-dark-300 border border-dark-400 text-white text-sm rounded-md focus:outline-none focus:ring-2 py-1.5 px-3 disabled:opacity-70"
                      style={{ focusRingColor: chakraState.color }}
                      defaultValue="private"
                    >
                      <option value="public">Public (Anyone can find and join)</option>
                      <option value="discoverable">Discoverable (Requires approval)</option>
                      <option value="private">Private (Invitation only)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    {isEditing ? (
                      <TattooButton
                        onClick={() => setIsEditing(false)}
                        chakraColor={chakraState.color}
                        size="sm"
                      >
                        Save Changes
                      </TattooButton>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg bg-dark-300 text-gray-300 hover:bg-dark-400"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-dark-300">
                <div className="flex items-center">
                  <Eye size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm text-white">Allow Anonymous Viewing</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-dark-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-dark-300">
                <div className="flex items-center">
                  <Shield size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm text-white">Require Approval for New Members</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-dark-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-dark-300">
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm text-white">Allow Member Invitations</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-dark-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dark-400">
              <button
                className="flex items-center text-red-400 hover:text-red-300 text-sm"
              >
                <Trash2 size={16} className="mr-1" />
                Delete Circle
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-dark-200 p-4 rounded-2xl border border-dark-300 ${className}`}>
      <div className="flex items-center mb-4">
        <Settings size={18} className="mr-2" style={{ color: chakraState.color }} />
        <h3 className="text-lg font-medium text-white">Circle Moderation</h3>
      </div>
      
      <div className="flex border-b border-dark-400 mb-4">
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'featured' 
              ? 'text-white border-b-2' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          style={{
            borderColor: activeTab === 'featured' ? chakraState.color : 'transparent'
          }}
        >
          Featured
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'roles' 
              ? 'text-white border-b-2' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          style={{
            borderColor: activeTab === 'roles' ? chakraState.color : 'transparent'
          }}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'settings' 
              ? 'text-white border-b-2' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          style={{
            borderColor: activeTab === 'settings' ? chakraState.color : 'transparent'
          }}
        >
          Settings
        </button>
      </div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default CircleModeration;