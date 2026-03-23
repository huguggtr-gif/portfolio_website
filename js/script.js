document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger)

  // ─────────────────────────────────────────────
  //  마우스 커서
  // ─────────────────────────────────────────────
  const cursor = document.querySelector('.cursor')
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.1,
      ease: 'power2.out',
    })
  })

  const hoverTargets = document.querySelectorAll(
    'a, .img-box, .dot, .timeline-item, .portfolio-card',
  )
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => cursor.classList.add('active'))
    target.addEventListener('mouseleave', () =>
      cursor.classList.remove('active'),
    )
  })

  // ─────────────────────────────────────────────
  //  메인페이지 인트로 애니메이션
  // ─────────────────────────────────────────────
  gsap.from('.hero-left h1', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  })

  // ─────────────────────────────────────────────
  //  ABOUT 타임라인 애니메이션 (PC 가로 / 모바일 세로)
  // ─────────────────────────────────────────────
  let mm = gsap.matchMedia()

  mm.add('(min-width: 769px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-two',
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to('.line-horizontal', {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut',
    })
      .from(
        '.timeline-wrapper .dot',
        { scale: 0, duration: 0.3, stagger: 0.1 },
        '-=1.0',
      )
      .to(
        '.timeline-wrapper .year',
        { opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.6',
      )
      .to(
        '.timeline-wrapper .line-vertical',
        {
          height: '140px',
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        },
        '-=0.6',
      )
      .to(
        '.timeline-wrapper .content',
        { opacity: 1, x: 5, duration: 0.5, stagger: 0.1 },
        '-=0.4',
      )
  })

  mm.add('(max-width: 768px)', () => {
    gsap.utils.toArray('.v-item').forEach((item) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
    })
  })

  // ─────────────────────────────────────────────
  //  네비게이션 활성화 및 색상 제어
  // ─────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav ul li a')
  const sections = document.querySelectorAll(
    'section, .hero, .section-two, .section-portfolio, .section-skill, .section-contact',
  )
  const navElement = document.querySelector('.nav')

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) {
          const id = section.getAttribute('id')
          navLinks.forEach((link) => {
            link.classList.remove('active')
            if (link.getAttribute('href') === `#${id}`)
              link.classList.add('active')
          })
        }
      },
    })
  })

  const setNavMode = (triggerSelector, modeToAdd, otherModes = []) => {
    ScrollTrigger.create({
      trigger: triggerSelector,
      start: 'top 10%',
      end: 'bottom 10%',
      onEnter: () => {
        otherModes.forEach((mode) => navElement.classList.remove(mode))
        navElement.classList.add(modeToAdd)
      },
      onEnterBack: () => {
        otherModes.forEach((mode) => navElement.classList.remove(mode))
        navElement.classList.add(modeToAdd)
      },
      onLeave: () => navElement.classList.remove(modeToAdd),
      onLeaveBack: () => navElement.classList.remove(modeToAdd),
    })
  }

  setNavMode('.section-portfolio', 'dark-mode', ['skill-mode'])
  setNavMode('.section-skill', 'skill-mode', ['dark-mode'])
  setNavMode('.section-contact', 'dark-mode', ['skill-mode'])

  // ─────────────────────────────────────────────
  //  포트폴리오 헤더 + 카드 등장 애니메이션
  // ─────────────────────────────────────────────
  gsap
    .timeline({
      scrollTrigger: {
        trigger: '.section-portfolio',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    })
    .to('.portfolio-header', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
    .to(
      '.portfolio-card',
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power4.out',
      },
      '-=0.4',
    )

  // ─────────────────────────────────────────────
  //  포트폴리오 캐러셀 — 자연스러운 드래그 + 관성
  //
  //  핵심 변경점:
  //  1) mousemove / mouseup 을 window에 등록
  //     → 커서가 캐러셀 밖으로 나가도 드래그 유지,
  //       마우스를 떼면 어디서든 즉시 해제
  //  2) scroll-snap 완전 제거 → 카드에 걸리는 느낌 없음
  //  3) 드래그 이동거리(dragDist)로 클릭 vs 드래그 판별
  // ─────────────────────────────────────────────
  const carousel = document.getElementById('portfolioCarousel')

  if (carousel) {
    let isDown = false
    let startX = 0
    let scrollStart = 0
    let dragDist = 0
    let velX = 0
    let lastX = 0
    let lastTime = 0
    let rafId = null

    // ── 드래그 시작
    carousel.addEventListener('mousedown', (e) => {
      isDown = true
      dragDist = 0
      startX = e.clientX
      scrollStart = carousel.scrollLeft
      lastX = e.clientX
      lastTime = Date.now()
      velX = 0
      carousel.classList.add('is-dragging')
      cancelAnimationFrame(rafId)
      e.preventDefault() // 텍스트 선택 방지
    })

    // ── 드래그 중: window에 달아야 캐러셀 밖에서도 추적됨
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return
      const dx = e.clientX - startX
      dragDist = Math.abs(dx)
      carousel.scrollLeft = scrollStart - dx

      // 프레임 당 속도 계산 (16ms 기준)
      const now = Date.now()
      const dt = Math.max(now - lastTime, 1)
      velX = ((e.clientX - lastX) / dt) * 16
      lastX = e.clientX
      lastTime = now
    })

    // ── 드래그 끝: window에 달아야 어디서 떼도 확실히 해제됨
    window.addEventListener('mouseup', () => {
      if (!isDown) return
      isDown = false
      carousel.classList.remove('is-dragging')

      // 관성 스크롤
      const momentum = () => {
        if (Math.abs(velX) < 0.3) return
        carousel.scrollLeft -= velX
        velX *= 0.93
        rafId = requestAnimationFrame(momentum)
      }
      momentum()
    })

    // ── 클릭 vs 드래그 구분: 8px 이상 움직이면 링크 차단
    carousel.addEventListener('click', (e) => {
      if (dragDist > 8) {
        e.preventDefault()
        e.stopPropagation()
      }
    }, true)

    // ── 터치 지원 (모바일 스와이프 + 관성)
    let touchStartX = 0
    let touchScrollLeft = 0
    let touchVelX = 0
    let touchLastX = 0
    let touchLastTime = 0
    let touchRafId = null

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX
      touchScrollLeft = carousel.scrollLeft
      touchLastX = touchStartX
      touchLastTime = Date.now()
      touchVelX = 0
      cancelAnimationFrame(touchRafId)
    }, { passive: true })

    carousel.addEventListener('touchmove', (e) => {
      const dx = touchStartX - e.touches[0].clientX
      carousel.scrollLeft = touchScrollLeft + dx

      const now = Date.now()
      const dt = Math.max(now - touchLastTime, 1)
      touchVelX = ((e.touches[0].clientX - touchLastX) / dt) * 16
      touchLastX = e.touches[0].clientX
      touchLastTime = now
    }, { passive: true })

    carousel.addEventListener('touchend', () => {
      const touchMomentum = () => {
        if (Math.abs(touchVelX) < 0.3) return
        carousel.scrollLeft -= touchVelX
        touchVelX *= 0.93
        touchRafId = requestAnimationFrame(touchMomentum)
      }
      touchMomentum()
    }, { passive: true })
  }

  // ─────────────────────────────────────────────
  //  SKILL 섹션 애니메이션
  // ─────────────────────────────────────────────
  const marqueeContent = document.querySelector('.marquee-content')
  if (marqueeContent) {
    gsap.to(marqueeContent, {
      xPercent: -50,
      ease: 'none',
      duration: 15,
      repeat: -1,
    })
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
  })

  // ─────────────────────────────────────────────
  //  CONTACT 섹션 태그 애니메이션
  // ─────────────────────────────────────────────
  document.querySelectorAll('.tag').forEach((tag) => {
    gsap.to(tag, {
      x: 'random(-15, 15)',
      y: 'random(-15, 15)',
      rotation: 'random(-5, 5)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  })
})