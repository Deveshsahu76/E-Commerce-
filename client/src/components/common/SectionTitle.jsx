import React from "react";

const SectionTitle = ({ eyebrow, title, text, align = "left" }) => {
  return (
    <div className={`section-title section-title--${align}`}>
      {eyebrow && <span className="section-title__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
};

export default SectionTitle;