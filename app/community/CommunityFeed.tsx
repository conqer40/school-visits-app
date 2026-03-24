"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostAction, createCommentAction, deletePostAction, deleteCommentAction, toggleLikePostAction } from "./actions";

export default function CommunityFeed({ 
  posts, user, isAdmin, specializations, allowedSpecIds, allowedLevels, selectedSpecId, selectedLevel 
}: any) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = (type: "spec" | "level", value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(type, value);
    router.push(url.toString());
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("specializationId", selectedSpecId.toString());
    formData.append("level", selectedLevel);
    
    await createPostAction(formData);
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  const currentSpecName = specializations.find((s:any) => s.id === selectedSpecId)?.name || "غير محدد";

  return (
    <div className="grid-responsive" style={{ gridTemplateColumns: "1fr", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* 🎯 Filters Bar for Admin or Multi-Spec Supervisors */}
      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {(isAdmin || allowedSpecIds.length > 1) && (
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "5px", color: "var(--accent-primary)" }}>التخصص التعليمي:</label>
              <select 
                value={selectedSpecId} 
                onChange={(e) => handleFilterChange("spec", e.target.value)}
                style={{ padding: "0.5rem", borderRadius: "8px", width: "100%", background: "var(--background-light)", border: "1px solid var(--border)" }}
              >
                {specializations.filter((s:any) => isAdmin || allowedSpecIds.includes(s.id)).map((s:any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block", marginBottom: "5px", color: "var(--accent-cyan)" }}>المرحلة التعليمية:</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {allowedLevels.map((lvl: string) => (
                <button 
                  key={lvl}
                  onClick={() => handleFilterChange("level", lvl)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "20px",
                    border: "none",
                    background: selectedLevel === lvl ? "var(--accent-primary)" : "rgba(0,0,0,0.05)",
                    color: selectedLevel === lvl ? "white" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✍️ Create Post Card */}
      {!isAdmin && (
        <div className="card animate-fade-in" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "1rem", alignItems: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold), #fcd34d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--primary-deep-blue)" }}>
              {user.username.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem" }}>إنشاء منشور جديد</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--info)" }}>في مجتمع: {currentSpecName} - {selectedLevel}</p>
            </div>
          </div>
          
          <form onSubmit={handleCreatePost}>
            <textarea 
              name="content" 
              placeholder="بم تفكر؟ شارك تعميم، سؤال مهني، أو خبراتك مع زملائك الموجهين..."
              required
              rows={3}
              style={{ resize: "none", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", marginBottom: "1rem" }}
            ></textarea>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ padding: "0.6rem 2rem", borderRadius: "20px" }}>
                {isSubmitting ? "جاري النشر..." : "نشر المشاركة 🚀"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📰 Posts Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
        {posts.length === 0 ? (
          <div className="card text-center" style={{ padding: "3rem 1rem", color: "rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
            <h3>لا توجد منشورات حتى الآن</h3>
            <p>كن أول من يشارك في مجتمع {currentSpecName} - {selectedLevel}!</p>
          </div>
        ) : (
          posts.map((post: any) => {
            const isLiked = post.likes.some((l:any) => l.authorId === user.supervisorId);
            const canDeletePost = isAdmin || post.authorId === user.supervisorId;
            const postDate = new Date(post.createdAt).toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={post.id} className="card animate-fade-in" style={{ padding: "0", overflow: "visible" }}>
                {/* Post Header */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "1.2rem", boxShadow: "0 2px 10px rgba(37,99,235,0.3)" }}>
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: "800", color: "var(--secondary-dark-navy)" }}>{post.author.name}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--info)", fontWeight: "600" }}>موجه أقدم • {post.author.region}</span>
                        <div style={{ fontSize: "0.7rem", color: "gray", marginTop: "2px" }}>{postDate}</div>
                      </div>
                    </div>
                    
                    {canDeletePost && (
                      <form action={async () => { await deletePostAction(post.id); }}>
                        <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "1.2rem", opacity: 0.5, transition: "opacity 0.2s" }} title="حذف المنشور">🗑️</button>
                      </form>
                    )}
                  </div>

                  {/* Post Content */}
                  <div style={{ marginTop: "1rem", fontSize: "1.05rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </div>
                </div>

                {/* Post Actions Bar */}
                <div style={{ display: "flex", padding: "0.5rem 1.5rem", background: "rgba(0,0,0,0.02)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <form action={async () => { await toggleLikePostAction(post.id); }} style={{ flex: 1 }}>
                    <button type="submit" style={{ width: "100%", background: "none", border: "none", padding: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold", color: isLiked ? "var(--accent-primary)" : "gray", transition: "all 0.2s", borderRadius: "8px" }}>
                      <span style={{ fontSize: "1.2rem" }}>{isLiked ? "👍" : "👍🏻"}</span>
                      {post.likes.length > 0 && <span>{post.likes.length}</span>} إعجاب
                    </button>
                  </form>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold", color: "gray", cursor: "default" }}>
                    <span style={{ fontSize: "1.2rem" }}>💬</span>
                    {post.comments.length > 0 && <span>{post.comments.length}</span>} تعليق
                  </div>
                </div>

                {/* Comments Section */}
                <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.2)" }}>
                  {post.comments.map((comment: any) => {
                    const canDeleteComment = isAdmin || comment.authorId === user.supervisorId || post.authorId === user.supervisorId;
                    return (
                      <div key={comment.id} style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                        <div style={{ minWidth: "32px", height: "32px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "var(--secondary-dark-navy)" }}>
                          {comment.author.name.charAt(0)}
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.04)", padding: "0.8rem 1rem", borderRadius: "16px", flex: 1, position: "relative" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "var(--secondary-dark-navy)", marginBottom: "4px" }}>
                            {comment.author.name}
                          </div>
                          <div style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>{comment.content}</div>
                          
                          {canDeleteComment && (
                            <form action={async () => { await deleteCommentAction(comment.id); }} style={{ position: "absolute", top: "10px", left: "10px" }}>
                              <button type="submit" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem", opacity: 0.5 }}>🗑️</button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Comment Input */}
                  {!isAdmin && (
                     <form action={createCommentAction} style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                      <input type="hidden" name="postId" value={post.id} />
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "white" }}>
                        {user.username.charAt(0)}
                      </div>
                      <input 
                        type="text" 
                        name="content"
                        placeholder="أضف تعليقاً..." 
                        required 
                        style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "20px", background: "rgba(0,0,0,0.03)", border: "1px solid var(--border)", fontSize: "0.9rem" }}
                      />
                      <button type="submit" style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--accent-primary)" }}>✈️</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
