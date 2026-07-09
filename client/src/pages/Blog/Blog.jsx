import React from "react";
import { Link } from "react-router-dom";

const posts = [
  { id: 1, title: "How we pick featured products", excerpt: "A short guide to curating items that convert." },
  { id: 2, title: "Tips for product photography", excerpt: "Quick tips for shooting clean product photos." },
];

const Blog = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-semibold text-slate-900">Blog</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <article key={p.id} className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">{p.title}</h2>
            <p className="mt-2 text-slate-600">{p.excerpt}</p>
            <Link to="#" className="mt-3 inline-block text-sm font-semibold text-slate-900">Read more </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
