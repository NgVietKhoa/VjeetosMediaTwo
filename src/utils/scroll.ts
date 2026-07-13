export const scrollContainerByOneCard = (
  container: HTMLDivElement | null,
  direction: "left" | "right",
  gap: number = 16
) => {
  if (!container) return;
  const card = container.querySelector("a") || container.firstElementChild;
  if (!card) return;
  const cardWidth = card.getBoundingClientRect().width + gap;
  container.scrollBy({
    left: direction === "left" ? -cardWidth : cardWidth,
    behavior: "smooth",
  });
};
