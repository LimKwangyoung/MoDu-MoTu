import { useEffect, useState, useRef } from 'react';

import IndicatorCard from './IndicatorCard';

import styles from './Indicators.module.css';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// 슬라이더 설정
// const sliderSettings = {
//   dots: false,
//   infinite: true,
//   speed: 2500,
//   slidesToShow: 4,
//   slidesToScroll: 1,
//   swipeToSlide: true,
//   arrows: false,
//   centerMode: false,
//   ltr: true,
//   autoplay: true, // 자동으로 슬라이드 전환
//   autoplaySpeed: 0,
//   cssEase: 'linear',
//   responsive: [
//     {
//       breakpoint: 1440,
//       settings: {
//         slidesToShow: 3,
//       },
//     },

//     {
//       breakpoint: 992,
//       settings: {
//         slidesToShow: 2,
//       },
//     },

//     {
//       breakpoint: 768,
//       settings: {
//         slidesToShow: 1,
//       },
//     },
//   ],
// };

const Indicators: React.FC = () => {
  const [formattedData, setFormattedData] = useState<JSX.Element[]>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indices = ['코스피', '코스닥', '다우존스', '나스닥', '원/달러', '엔/달러', '금', 'WTI'];
    const dataElements = indices.map((index, i) => (
      <IndicatorCard key={i} indexTypeId={Math.floor(i / 2)} index={index} />
    ));

    const duplicatedElements = indices.map((index, i) => (
      <IndicatorCard key={`indicator-${i}`} indexTypeId={Math.floor(i / 2)} index={index} />
    ));

    setFormattedData([...dataElements, ...duplicatedElements]);
  }, []);

  return (
    <section className={styles.marqueeContainer}>
      <div className={styles.marquee} ref={marqueeRef}>
        {formattedData}
        {formattedData}
      </div>
    </section>
  );
};

export default Indicators;
