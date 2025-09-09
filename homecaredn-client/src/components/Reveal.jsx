// src/components/Reveal.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import useInView from '../hook/useInView';

export default function Reveal({
  children,
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  once = true,
  className = '',
}) {
  // memo hóa options để ổn định tham chiếu
  const options = useMemo(() => ({ threshold, rootMargin }), [threshold, rootMargin]);
  const [ref, isVisible] = useInView(options, { once });

  return (
    <div ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  once: PropTypes.bool,
  className: PropTypes.string,
};
