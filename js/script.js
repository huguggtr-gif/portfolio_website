document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  //  마우스 커서
  const cursor = document.querySelector('.cursor');
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.1,
      ease: 'power2.out'
    });
  });

  const hoverTargets = document.querySelectorAll('a, .img-box, .dot, .timeline-item, .portfolio-card');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => cursor.classList.add('active'));
    target.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });

  //  메인페이지 인트로 애니메이션
  gsap.from('.hero-left h1', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  //  ABOUT 타임라인 애니메이션 (PC 가로 / 모바일 세로 분리)
  let mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    // --- [PC용 가로 애니메이션] ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-two',
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.line-horizontal', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
      .from('.timeline-wrapper .dot', { scale: 0, duration: 0.3, stagger: 0.1 }, '-=1.0')
      .to('.timeline-wrapper .year', { opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.6')
      .to('.timeline-wrapper .line-vertical', {
        height: '140px',
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.6')
      .to('.timeline-wrapper .content', { opacity: 1, x: 5, duration: 0.5, stagger: 0.1 }, '-=0.4');
  });

  mm.add("(max-width: 768px)", () => {
    // --- [모바일/태블릿용 세로 애니메이션] ---
    gsap.utils.toArray('.v-item').forEach((item) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%', 
          toggleActions: 'play none none reverse'
        },
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  });

  //  네비게이션 활성화 및 색상 제어
  const navLinks = document.querySelectorAll('.nav ul li a');
  const sections = document.querySelectorAll('section, .hero, .section-two, .section-portfolio, .section-skill, .section-contact');
  const navElement = document.querySelector('.nav');

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) {
          const id = section.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
          });
        }
      },
    });
  });

  // 섹션별 네비게이션 모드 전환
  const setNavMode = (triggerSelector, modeToAdd, otherModes = []) => {
    ScrollTrigger.create({
      trigger: triggerSelector,
      start: 'top 10%',
      end: 'bottom 10%',
      onEnter: () => {
        otherModes.forEach(mode => navElement.classList.remove(mode));
        navElement.classList.add(modeToAdd);
      },
      onEnterBack: () => {
        otherModes.forEach(mode => navElement.classList.remove(mode));
        navElement.classList.add(modeToAdd);
      },
      onLeave: () => navElement.classList.remove(modeToAdd),
      onLeaveBack: () => navElement.classList.remove(modeToAdd),
    });
  };

  setNavMode('.section-portfolio', 'dark-mode', ['skill-mode']);
  setNavMode('.section-skill', 'skill-mode', ['dark-mode']);
  setNavMode('.section-contact', 'dark-mode', ['skill-mode']);

  //  포트폴리오 카드 애니메이션
  gsap.timeline({
    scrollTrigger: {
      trigger: '.section-portfolio',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    },
  })
    .to('.portfolio-textcard', { opacity: 1, y: 0, duration: 0.8 })
    .to('.portfolio-card', { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power4.out' }, '-=0.4');

  //  SKILL 섹션 애니메이션
  const marqueeContent = document.querySelector('.marquee-content');
  if (marqueeContent) {
    gsap.to(marqueeContent, {
      xPercent: -50,
      ease: 'none',
      duration: 15,
      repeat: -1,
    });
  }

  gsap.from('.experience-text, .description-text', {
    scrollTrigger: {
      trigger: '.section-skill',
      start: 'top 80%',
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.3,
  });

  //  CONTACT 섹션 태그 애니메이션
  document.querySelectorAll('.tag').forEach((tag) => {
    gsap.to(tag, {
      x: 'random(-15, 15)',
      y: 'random(-15, 15)',
      rotation: 'random(-5, 5)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });
});