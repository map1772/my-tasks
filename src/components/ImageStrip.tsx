const images = [
  { src: '/images/microphone.svg', alt: 'Микрофон в свете софита' },
  { src: '/images/glass.svg', alt: 'Светлая абстрактная композиция' },
  { src: '/images/architecture.svg', alt: 'Архитектурные формы и свет' },
];

export const ImageStrip = () => (
  <div className="image-strip" aria-label="Вдохновение на день">
    {images.map((image) => (
      <div className="image-strip__frame" key={image.src}>
        <img src={image.src} alt={image.alt} />
      </div>
    ))}
  </div>
);
