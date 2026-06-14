export function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);

  if (section) {
    const targetTop = section.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }
}
