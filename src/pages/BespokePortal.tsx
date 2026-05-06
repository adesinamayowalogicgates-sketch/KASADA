import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Hammer,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

interface BespokeProject {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  budget: number;
  status: 'Draft' | 'Matching' | 'In Progress' | 'Delivered';
  createdAt: Timestamp;
}

const BespokePortal: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useCart();
    const [projects, setProjects] = useState<BespokeProject[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newProject, setNewProject] = useState({
      title: '',
      description: '',
      budget: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  
    useEffect(() => {
      if (!user) return;
  
      const q = query(
        collection(db, 'bespoke_requests'), 
        where('userId', '==', user.uid)
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BespokeProject));
        setProjects(docs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bespoke_requests');
      });
  
      return () => unsubscribe();
    }, [user]);
  
    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setIsSubmitting(true);
  
      try {
        await addDoc(collection(db, 'bespoke_requests'), {
          userId: user.uid,
          userEmail: user.email, // Added userEmail as required by rules
          userName: user.displayName || 'Client',
          title: newProject.title,
          description: newProject.description,
          budget: Number(newProject.budget),
          status: 'pending', // Match rule-allowed statuses
          createdAt: Timestamp.now()
        });
        showToast("Bespoke concept saved");
        setIsCreating(false);
        setNewProject({ title: '', description: '', budget: '' });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'bespoke_requests');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleDelete = async (id: string) => {
      try {
        await deleteDoc(doc(db, 'bespoke_requests', id));
        showToast("Concept deleted");
        setDeletingProjectId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bespoke_requests/${id}`);
      }
    };
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 sm:mb-20 gap-8">
            <div>
              <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Craft Your Narrative</span>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold tracking-tight">The Bespoke <br/>Registry.</h1>
            </div>
            {!isCreating && (
              <button 
                onClick={() => setIsCreating(true)}
                className="group flex items-center space-x-4 bg-brand-onyx text-white px-8 sm:px-10 py-5 rounded-full font-bold hover:bg-brand-copper active:scale-95 transition-all shadow-xl"
              >
                <Plus size={20} />
                <span>New Concept</span>
              </button>
            )}
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16">
            <div className="lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {isCreating && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-brand-onyx/5 mb-12 sm:mb-16"
                  >
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-serif font-bold">Concept Definition</h3>
                      <button onClick={() => setIsCreating(false)} className="text-brand-slate hover:text-brand-onyx"><Plus className="rotate-45" /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-3 block">Project Title</label>
                        <input 
                          required
                          value={newProject.title}
                          onChange={e => setNewProject({...newProject, title: e.target.value})}
                          className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                          placeholder="e.g. Master Bedroom Sanctuary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-3 block">Philosophy & Brief</label>
                        <textarea 
                          required
                          value={newProject.description}
                          onChange={e => setNewProject({...newProject, description: e.target.value})}
                          rows={4}
                          className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                          placeholder="Describe the mood, materials, and functional goals..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-3 block">Target Budget (₦)</label>
                        <input 
                          required
                          type="number"
                          value={newProject.budget}
                          onChange={e => setNewProject({...newProject, budget: e.target.value})}
                          className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                          placeholder="Min: 500,000"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-copper text-white py-5 rounded-full font-bold hover:bg-brand-onyx transition-all shadow-xl disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving Concept...' : 'Save to Registry'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
  
              {projects.length === 0 && !isCreating ? (
                <div className="bg-brand-onyx/5 rounded-[3rem] p-16 sm:p-24 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-copper mx-auto mb-8 shadow-xl">
                    <Palette size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">No Custom Concepts Yet</h3>
                  <p className="text-brand-slate font-light mb-12">Start a bespoke project to collaborate with Nigeria's top artisans on your dream pieces.</p>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-brand-onyx text-white px-10 py-4 rounded-full font-bold hover:bg-brand-copper transition-all"
                  >
                    Kickoff First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {projects.map((project) => (
                    <motion.div 
                      layout
                      key={project.id}
                      className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-brand-onyx/5 group relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-4">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                              project.status === 'Draft' ? "bg-brand-alabaster text-brand-slate" : "bg-green-500 text-white"
                            )}>
                              {project.status}
                            </span>
                            <span className="text-[8px] text-brand-slate font-black uppercase tracking-widest">
                              Conceptualized {project.createdAt.toDate().toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-2xl font-serif font-bold mb-4">{project.title}</h3>
                          <p className="text-brand-slate text-sm font-light leading-relaxed mb-8 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Target Budget</p>
                              <p className="font-bold">₦{project.budget.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-3 text-brand-copper">
                              <MessageSquare size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Chat with Artisan</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          <button 
                            onClick={() => {
                              const message = `Hello KASADA, I'd like to discuss my bespoke project: ${project.title}.`;
                              window.open(`https://wa.me/2348123456789?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="bg-brand-onyx text-white p-5 rounded-3xl hover:bg-brand-copper transition-colors"
                          >
                            <MessageSquare size={20} />
                          </button>
                          
                          {deletingProjectId === project.id ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 bg-red-500 text-white pl-6 p-2 rounded-3xl"
                            >
                              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Confirm?</span>
                              <button onClick={() => handleDelete(project.id)} className="bg-white text-red-500 px-4 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest">Yes</button>
                              <button onClick={() => setDeletingProjectId(null)} className="p-3 bg-white/20 rounded-2xl hover:bg-white/40 transition-colors">
                                <Plus className="rotate-45" size={14} />
                              </button>
                            </motion.div>
                          ) : (
                            <button 
                              onClick={() => setDeletingProjectId(project.id)}
                              className="bg-red-50 text-red-500 p-5 rounded-3xl hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
  
            <div className="space-y-8 sm:space-y-12">
              <div className="bg-brand-onyx text-brand-alabaster p-10 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <Sparkles className="absolute -top-12 -right-12 text-brand-copper opacity-20" size={160} />
                <h4 className="text-xl font-serif font-bold mb-8 relative z-10">Artisan Matchmaker</h4>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-10 relative z-10">
                  Our system analyzes your brief and budget to match you with the architectural artisan whose style aligns with your vision.
                </p>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-copper shrink-0"><Zap size={20} /></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Instant Style Fit</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-copper shrink-0"><Hammer size={20} /></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Heritage Techniques</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-copper shrink-0"><ImageIcon size={20} /></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Progress Visuals</p>
                  </div>
                </div>
              </div>
  
              <div className="p-10 sm:p-12 border border-brand-onyx/10 rounded-[2.5rem]">
                <h4 className="text-lg font-serif font-bold mb-6">Concierge Support</h4>
                <p className="text-brand-slate text-sm font-light leading-relaxed mb-8">
                  Need help defining your concept or picking materials? Our design consultants are available for direct consultation.
                </p>
                <button 
                  onClick={async () => {
                    if (!user) return;
                    try {
                      await addDoc(collection(db, 'callback_requests'), {
                        userId: user.uid,
                        userEmail: user.email,
                        userName: user.displayName || 'Client',
                        type: 'Bespoke Consultation',
                        status: 'pending',
                        createdAt: Timestamp.now()
                      });
                      showToast("Callback requested. We'll be in touch shortly.");
                    } catch (error) {
                      handleFirestoreError(error, OperationType.CREATE, 'callback_requests');
                    }
                  }}
                  className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-colors"
                >
                  <CheckCircle2 size={16} />
                  <span>Request Callback</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
export default BespokePortal;
