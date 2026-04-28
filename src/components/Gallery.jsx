import HeroCard from './HeroCard';
import './Gallery.css';

function Gallery({ heroes }) {
  if (heroes.length === 0) {
    return (
      <div className="gallery-empty">
        <p>Герои не найдены</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      {heroes.map((hero) => (
        <HeroCard key={hero.id} hero={hero} />
      ))}
    </div>
  );
}

export default Gallery;