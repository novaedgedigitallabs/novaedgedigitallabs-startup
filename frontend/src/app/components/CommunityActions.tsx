'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageSquare, Send } from 'lucide-react';

export default function CommunityActions({ slug }: { slug: string }) {
  const [likes, setLikes] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // For demo purposes, we simulate a logged-in user
  const currentUser = "github_user_123"; 

  useEffect(() => {
    fetchCommunityData();
    fetchComments();
  }, [slug]);

  const fetchCommunityData = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/startups/${slug}/community?user_id=${currentUser}`);
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setBookmarks(data.bookmarks);
        setHasLiked(data.hasLiked);
        setHasBookmarked(data.hasBookmarked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/startups/${slug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLike = async () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    try {
      await fetch(`http://localhost:4000/api/startups/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser })
      });
      fetchCommunityData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBookmark = async () => {
    setHasBookmarked(!hasBookmarked);
    setBookmarks(prev => hasBookmarked ? prev - 1 : prev + 1);
    try {
      await fetch(`http://localhost:4000/api/startups/${slug}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser })
      });
      fetchCommunityData();
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/startups/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mt-12 flex flex-col gap-8 w-full">
      <div className="flex items-center gap-6 border-b border-white/10 pb-6">
        <button 
          onClick={toggleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            hasLiked 
              ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="font-semibold">{likes}</span>
        </button>

        <button 
          onClick={toggleBookmark}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            hasBookmarked 
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${hasBookmarked ? 'fill-current' : ''}`} />
          <span className="font-semibold">{bookmarks}</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">{comments.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold text-white">Discussion</h3>
        
        <form onSubmit={submitComment} className="flex gap-4">
          <input 
            type="text" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-300">@{comment.user_id}</span>
                <span className="text-xs text-white/40">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/80">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-white/40 italic py-4">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
