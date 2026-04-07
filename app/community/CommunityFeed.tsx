"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostAction, createCommentAction, deletePostAction, deleteCommentAction, toggleLikePostAction } from "./actions";
import SearchableSelect from "@/app/components/SearchableSelect";

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
              <SearchableSelect 
                name="selectedSpecId"
                defaultValue={String(selectedSpecId)} 
                onChange={(value) => handleFilterChange("spec", value)}
                options={specializations.filter((s:any) => isAdmin || allowedSpecIds.includes(s.id)).map((s:any) => ({ value: String(s.id), label: s.name }))}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", background: "var(--background-light)", border: "1px solid var(--border)" }}
              />
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
      <div className="card animate-fade-in" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "1rem", alignItems: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: isAdmin ? "var(--danger)" : "linear-gradient(135deg, var(--accent-gold), #fcd34d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: isAdmin ? "white" : "var(--primary-deep-blue)" }}>
            {isAdmin ? "🛡️" : user.username.charAt(0)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem" }}>{isAdmin ? "بصفتك مدير النظام" : "إنشاء منشور جديد"}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--info)" }}>في مجتمع: {currentSpecName} - {selectedLevel}</p>
          </div>
        </div>
        
        <form onSubmit={handleCreatePost}>
          <textarea 
            name="content" 
            placeholder={isAdmin ? "اكتب تعميماً أو إعلاناً رسمياً للمجتمع..." : "بم تفكر؟ شارك تعميم، سؤال مهني، أو خبراتك مع زملائك الموجهين..."}
            required
            rows={3}
            style={{ resize: "none", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", marginBottom: "1rem" }}
          ></textarea>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ padding: "0.6rem 2rem", borderRadius: "20px", background: isAdmin ? "var(--danger)" : "var(--accent-primary)" }}>
              {isSubmitting ? "جاري النشر..." : (isAdmin ? "نشر كمدير 🛡️" : "نشر المشاركة 🚀")}
            </button>
          </div>
        </form>
      </div>

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
            const isLiked = user.supervisorId ? post.likes.some((l:any) => l.authorId === user.supervisorId) : false;
            const isMine = isAdmin ? (post.authorId === null) : (post.authorId === user.supervisorId);
            const canDeletePost = isAdmin || isMine;
            const postDate = new Date(post.createdAt).toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={post.id} className="card animate-fade-in" style={{ padding: "0", overflow: "visible" }}>
                {/* Post Header */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: post.authorId === null ? "var(--danger)" : "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "1.2rem", boxShadow: "0 2px 10px rgba(37,99,235,0.3)" }}>
                        {post.authorId === null ? "🛡️" : post.author.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: "800", color: post.authorId === null ? "var(--danger)" : "var(--secondary-dark-navy)" }}>{post.authorId === null ? "مدير النظام" : post.author.name}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--info)", fontWeight: "600" }}>{post.authorId === null ? "إدارة غرب الزقازيق" : `موجه أقدم • ${post.author.region}`}</span>
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
                        <div style={{ minWidth: "32px", height: "32px", borderRadius: "50%", background: comment.authorId === null ? "var(--danger)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: comment.authorId === null ? "white" : "var(--secondary-dark-navy)" }}>
                          {comment.authorId === null ? "🛡️" : comment.author.name.charAt(0)}
                        </div>
                        <div style={{ background: comment.authorId === null ? "rgba(239,68,68,0.05)" : "rgba(0,0,0,0.04)", padding: "0.8rem 1rem", borderRadius: "16px", flex: 1, position: "relative", border: comment.authorId === null ? "1px solid rgba(239,68,68,0.2)" : "none" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.85rem", color: comment.authorId === null ? "var(--danger)" : "var(--secondary-dark-navy)", marginBottom: "4px" }}>
                            {comment.authorId === null ? "مدير النظام" : comment.author.name}
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
                  <form action={createCommentAction} style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <input type="hidden" name="postId" value={post.id} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isAdmin ? "var(--danger)" : "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "white" }}>
                      {isAdmin ? "🛡️" : user.username.charAt(0)}
                    </div>
                    <input 
                      type="text" 
                      name="content"
                      placeholder={isAdmin ? "الرد كمدير للنظام..." : "أضف تعليقاً..."} 
                      required 
                      style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "20px", background: "rgba(0,0,0,0.03)", border: "1px solid var(--border)", fontSize: "0.9rem" }}
                    />
                    <button type="submit" style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: isAdmin ? "var(--danger)" : "var(--accent-primary)" }}>✈️</button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
