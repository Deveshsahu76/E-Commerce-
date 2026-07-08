import { Link } from "react-router-dom";

const InfoPage = ({ eyebrow, title, intro, sections = [], cta }) => {
  return (
    <section className="info-page page-section">
      <div className="container">
        <div className="page-hero compact">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>

        <div className="info-card-list">
          {sections.map((section) => (
            <article className="info-card" key={section.title}>
              <h2>{section.title}</h2>
              {section.description && <p>{section.description}</p>}
              {section.points && (
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {cta && (
          <div className="soft-cta">
            <div>
              <span className="eyebrow">{cta.eyebrow || "Need help?"}</span>
              <h2>{cta.title}</h2>
              <p>{cta.text}</p>
            </div>
            <Link className="btn btn-primary" to={cta.to || "/contact"}>
              {cta.label || "Contact Support"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default InfoPage;