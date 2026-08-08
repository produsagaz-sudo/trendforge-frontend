import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { SiMessenger } from "react-icons/si";


export default function Editorial() {

  const portfolio = [
    {
      image: "/images/look1.png",
      title: "HADES",
      description:
        "Não é apenas uma estampa. É a representação do deus que governa o Submundo, reinterpretado em uma linguagem contemporânea. Uma fusão entre arte, mitologia e streetwear para quem carrega intensidade em cada detalhe.",
      footer: "Forged In Darkness. Worn With Power.",
    },
    {
      image: "/images/look2.png",
      title: "ZEUS",
      description:
        "Símbolo de poder absoluto e domínio dos céus, Zeus inspira uma peça intensa e imponente. Cada detalhe foi pensado para transmitir força, confiança e autenticidade.",
      footer: "Forjada Pelo Trovão.",
    },
    {
      image: "/images/look3.png",
      title: "POSEIDON",
      description:
        "Inspirada no soberano dos mares, esta arte representa força, liberdade e a imponência das águas. Uma peça criada para quem enfrenta qualquer tempestade e transforma desafios em poder.",
      footer: "Feita Para Dominar As Marés.",
    },
  ];


  const [index, setIndex] = useState(0);


  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % portfolio.length);
  };


  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + portfolio.length) % portfolio.length);
  };


  const imgRef = useRef(null);
  const textRef = useRef(null);


  const textInView = useInView(textRef, {
    once:true,
    margin:"-100px"
  });


  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset:["start end","end start"],
  });


  const imgY = useTransform(
    scrollYProgress,
    [0,1],
    ["0%","-15%"]
  );



  return (

<section className="relative overflow-hidden">


<div className="grid lg:grid-cols-2 gap-10 items-center">


{/* IMAGEM PRINCIPAL */}

<div
ref={imgRef}
className="relative overflow-hidden"
>


<AnimatePresence mode="wait">

<motion.img

key={portfolio[index].image}

src={portfolio[index].image}

alt={portfolio[index].title}

className="
w-full
h-[60vh]
lg:h-[80vh]
object-cover
"

style={{
y:imgY
}}

initial={{
opacity:0,
scale:1.05
}}

animate={{
opacity:1,
scale:1
}}

exit={{
opacity:0
}}

transition={{
duration:0.6
}}

loading="lazy"

/>

</AnimatePresence>



<button
onClick={prevSlide}
className="
absolute
left-4
top-1/2
-translate-y-1/2
z-20
bg-black/50
hover:bg-brand-red
transition-all
duration-300
w-12
h-12
text-white
text-xl
flex
items-center
justify-center
"
>
←
</button>



<button
onClick={nextSlide}
className="
absolute
right-4
top-1/2
-translate-y-1/2
z-20
bg-black/50
hover:bg-brand-red
transition-all
duration-300
w-12
h-12
text-white
text-xl
flex
items-center
justify-center
"
>
→
</button>


</div>





{/* TEXTO */}

<div ref={textRef}>


<motion.p
className="
text-xs
font-bold
uppercase
tracking-[0.3em]
text-brand-red
mb-4
"
initial={{opacity:0,x:40}}
animate={textInView ? {opacity:1,x:0}:{}}
transition={{duration:0.7}}
>
PORTFÓLIO
</motion.p>



<motion.h2
key={portfolio[index].title}
className="
font-heading
text-3xl
sm:text-4xl
lg:text-5xl
font-black
tracking-tighter
text-[var(--text-primary)]
leading-tight
mb-6
"
initial={{opacity:0,x:40}}
animate={{opacity:1,x:0}}
transition={{duration:0.7}}
>

{portfolio[index].title}

</motion.h2>



<motion.p
className="
text-base
lg:text-lg
leading-relaxed
text-[var(--text-secondary)]
mb-8
"
initial={{opacity:0,x:40}}
animate={{opacity:1,x:0}}
transition={{duration:0.7}}
>

{portfolio[index].description}

</motion.p>



<motion.p
className="
text-sm
font-bold
uppercase
tracking-[0.2em]
text-[var(--text-primary)]
"
>

{portfolio[index].footer}

</motion.p>



</div>

</div>





<EditorialGrid />





{/* MESSENGER FLOAT */}
<a
  href="https://ig.me/m/trendforge_ofc"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Abrir mensagem"
  className="
    fixed
    bottom-6
    right-6
    z-[999]
    w-16
    h-16
    rounded-full
    bg-white
    flex
    items-center
    justify-center
    shadow-2xl
    hover:scale-110
    transition-all
    duration-300
  "
>
  <SiMessenger size={32} className="text-black" />
</a>



</section>

  );

}







function EditorialGrid(){

const ref = useRef(null);

const inView = useInView(ref,{
once:true,
margin:"-100px"
});


return (

<div
ref={ref}
className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
>



{/* ESQUERDA */}

<motion.div

className="md:col-span-5 overflow-hidden"

initial={{opacity:0,y:60}}

animate={inView ? {opacity:1,y:0}:{}}

transition={{duration:0.8}}

>

<img

src="https://i.imgur.com/WUDtWXV.jpeg"

alt="Red neon urban"

className="
w-full
h-[50vh]
md:h-[60vh]
object-cover
hover:scale-105
transition-transform
duration-700
"

loading="lazy"

/>

</motion.div>






{/* DIREITA */}

<motion.div

className="
md:col-span-7
overflow-hidden
relative
"

initial={{opacity:0,y:60}}

animate={inView ? {opacity:1,y:0}:{}}

transition={{
duration:0.8,
delay:0.15
}}

>


<img

src="https://i.imgur.com/cRAIXhv.png"

alt="Urban architecture"

className="
w-full
h-[50vh]
md:h-[60vh]
object-cover
hover:scale-105
transition-transform
duration-700
"

loading="lazy"

/>



<div
className="
absolute
inset-0
flex
items-end
p-6
md:p-10
"
>


<div>

<p
className="
text-xs
font-bold
uppercase
tracking-[0.3em]
text-brand-red
mb-2
"
>
Manifesto
</p>



<h3
className="
font-heading
text-2xl
sm:text-3xl
lg:text-4xl
font-black
tracking-tighter
text-white
leading-tight
"
>

NOT FOR
<br/>
EVERYONE

</h3>


</div>


</div>


</motion.div>



</div>


);

}