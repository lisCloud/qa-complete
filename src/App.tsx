import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { notes } from './notes'
import character from './assets/character.gif'
import './gsap-brand.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

type Note = {
  author: string;
  note: string;
}


export default function App() {
  const main = useRef<HTMLElement | null>(null);
  const [note, setNote] = useState<Note>(notes[0]);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  const snapTriggers = useRef<ScrollTrigger[]>([]);
  const { contextSafe } = useGSAP(
    () => {
      let panels = gsap.utils.toArray('.panel'),
          scrollStarts = [0],
          snapScroll = (value: number, direction: number) => value;
      
      panels.forEach((panel, i) => {
        snapTriggers.current[i] = ScrollTrigger.create({
          trigger: panel as HTMLElement,
          start: "top top"
        });
      });

      ScrollTrigger.addEventListener("refresh", () => {
        scrollStarts = snapTriggers.current.map(trigger => trigger.start);
        snapScroll = ScrollTrigger.snapDirectional(scrollStarts);
      });
      
      ScrollTrigger.observe({
        type: "wheel,touch,pointer",
        onChangeY(self) {
          if (!scrollTween.current) {
            let scroll = snapScroll(self.scrollY() + self.deltaY, self.deltaY > 0 ? 1 : -1);
            goToSection(scrollStarts.indexOf(scroll));
          }
        }
      })

      ScrollTrigger.refresh();
    },
    {
      scope: main,
      revertOnUpdate: true,
    }
  );

  const goToSection = contextSafe((i: number) => {
    scrollTween.current = gsap.to(window, {
      scrollTo: { y: snapTriggers.current[i].start, autoKill: false },
      duration: 1,
      onComplete: () => (scrollTween.current = null),
      overwrite: true
    });
  });

  const getNextNote = () => {
    const currentIndex = notes.findIndex(n => n.author === note.author && n.note === note.note);
    const nextIndex = (currentIndex + 1) % notes.length;
    setNote(notes[nextIndex]);
  }

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(note.note.slice(0, i + 1));
      i++;
      if (i === note.note.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Adjust speed here (ms per letter)
    return () => clearInterval(interval);
  }, [note]);

  return (
    <main ref={main}>
      <section className="description panel light">
        <div>
          <h1>
            Sometimes, life feels like a <span className="highlight">video game</span> 🎮
          </h1>
          <div className="scroll-down">
            Scroll down<div className="arrow"></div>
          </div>
        </div>
      </section>

      <section className="panel dark">
        <h2>With highs and lows, resets and flows 🌊</h2>
      </section>

      <section className="panel purple">
        <h2>Sometimes brighter, bursting with color 🌈</h2>
      </section>

      <section className="panel orange">
        <div>
          <h2>And Like the best co-op games 🤝</h2>
        </div>
      </section>
      <section className="panel red">
        <div>
          <h1 style={{ marginBottom: '20vh' }}>The best part is playing together 🕹️</h1>
          <div className='pixel-character'>
            <div>
              <img 
                src={character}
                alt="Character"
                className="character"
              />
            </div>
            <div>
              <div className='box'>
                <div className='base' id='dialogue'>
                  <div style={{ flex: 'flex', alignItems: 'flex-end'}}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p className='text'>{displayedText}</p>
                      <p className='author'><b> - {note.author}</b></p>
                    </div>
                    <div
                      style={{ 
                        margin: '20px 0 0 0',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                      }}
                      onClick={!isTyping ? getNextNote : undefined}
                    >
                      <p style={{ margin: 0, padding: '0 5px' }}><b>Next</b></p>
                      <div className='fwd' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
