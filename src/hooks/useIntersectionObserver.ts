import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = '0% 0% -10% 0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);

  const frozen = isVisible && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, frozen]);

  return { elementRef, entry, isVisible };
};
