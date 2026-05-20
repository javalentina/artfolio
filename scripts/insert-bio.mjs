/**
 * Inserts biography from Биография.docx as structured career entries into Supabase settings.career
 * Run: node scripts/insert-bio.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL     = "https://pqincyataskeuklijyes.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID        = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const career = [
  {
    id: randomUUID(),
    year: "1996",
    title: {
      de: "Frühe Jahre",
      en: "Early Years",
      ru: "Ранние годы",
    },
    text: {
      ru: "Наталия Учитель родилась 8 октября 1996 года. В возрасте четырёх лет начала музыкальное образование в Специальной музыкальной школе при Санкт-Петербургской консерватории в классе Марины Вениаминовны Вольф. Уже в школьные годы она создавала собственные образовательные проекты и принимала участие в фестивалях в России и за рубежом.",
      de: "Natalia Uchitel wurde am 8. Oktober 1996 geboren. Im Alter von vier Jahren begann sie ihre musikalische Ausbildung an der Spezialmusikschule des St. Petersburger Konservatoriums bei Marina Veniaminovna Wolf. Bereits während ihrer Schulzeit entwickelte sie eigene musikpädagogische Projekte und nahm an Festivals in Russland und im Ausland teil.",
      en: "Born on October 8, 1996, Natalia Uchitel began her musical education at the age of four at the Special Music School of the St. Petersburg Conservatory under Marina Veniaminovna Wolf. Even as a student she developed her own educational projects and participated in festivals in Russia and abroad.",
    },
  },
  {
    id: randomUUID(),
    year: "2014",
    title: {
      de: "Konservatorium, Konzerte, Wettbewerbe",
      en: "Conservatory, concerts, competitions",
      ru: "Консерватория, концерты, конкурсы",
    },
    text: {
      ru: "С 2014 по 2019 год обучалась игре на фортепиано и музыкальной педагогике в Санкт-Петербургской консерватории в классе Петра Лаула. В этот период Наталия активно развивалась как пианистка и педагог.\n\nОна становилась лауреатом конкурсов для солистов и камерных ансамблей. В 2017 году Наталия получила диплом на конкурсе имени Роберта Шумана в Дюссельдорфе (Германия). В 2018 году стала лауреатом I премии конкурса Гуммерта в Казани. Также получила стипендию фестиваля Youth Classics Festival в Швейцарии и принимала участие в мастер-классах Дмитрия Башкирова, Константина Лифшица, Григория Грузмана, Наталии Трулль, Александра Сандлера и Андрея Диева.\n\nС 2015 года Наталия начала педагогическую деятельность параллельно с концертной практикой.",
      de: "Von 2014 bis 2019 studierte sie Klavier und Musikpädagogik am St. Petersburger Konservatorium in der Klasse von Peter Laul. In dieser Zeit entwickelte sie sich sowohl als Pianistin als auch als Pädagogin.\n\nSie erhielt Preise bei Klavierwettbewerben für Solisten und Kammermusik. 2017 wurde Natalia beim Robert-Schumann-Wettbewerb in Düsseldorf mit einem Diplom ausgezeichnet. 2018 gewann sie den 1. Preis beim Gummert-Wettbewerb in Kasan. Außerdem erhielt sie ein Stipendium des Youth Classics Festival in der Schweiz und nahm an Meisterkursen bei Dmitry Bashkirov, Konstantin Lifschitz, Gregory Gruzman, Nataliia Trull, Alexandr Sandler und Andrey Diev teil.\n\nAb 2015 begann Natalia parallel zu ihrer Konzerttätigkeit ihre pädagogische Laufbahn.",
      en: "From 2014 to 2019 she studied piano and pedagogy at the St. Petersburg Conservatory in the class of Peter Laul. During this period she developed both as a performer and pedagogue.\n\nShe has won prizes at piano competitions for soloists and chamber music. In 2017 Natalia received a diploma at the Robert Schumann Competition in Düsseldorf. In 2018 she was awarded 1st Prize at the Gummert Competition in Kazan. She also received a scholarship from the Youth Classics Festival in Switzerland and took part in masterclasses with Dmitry Bashkirov, Konstantin Lifschitz, Gregory Gruzman, Nataliia Trull, Alexandr Sandler, and Andrey Diev.\n\nFrom 2015 Natalia began her pedagogical career alongside her concert activity.",
    },
  },
  {
    id: randomUUID(),
    year: "2019–2023",
    title: {
      de: "Postgraduiertenstudium",
      en: "Postgraduate Studies",
      ru: "Последующие годы",
    },
    text: {
      ru: "С 2019 по 2021 год обучалась камерному ансамблю в Санкт-Петербургской консерватории в классе профессора Инги Дзекцер в рамках ассистентуры-стажировки.\n\nВ 2021 году вместе со своим трио получила Гран-при на Камерном конкурсе имени Слонимского в Волгограде.\n\nВ этот период Наталия активно выступала как солистка и камерный музыкант, а также расширяла международную концертную деятельность.\n\nПараллельно с концертной карьерой Наталия продолжала педагогическую работу в училище им Глинки для особо одарённых детей, где работала с 2017 по 2023 год.",
      de: "Von 2019 bis 2021 studierte sie Kammermusik am St. Petersburger Konservatorium bei Prof. Inga Dzekzer im Rahmen des postgradualen Konzertexamens.\n\n2021 gewann sie mit ihrem Trio den Grand Prix beim Slonimsky Kammermusikwettbewerb in Wolgograd.\n\nIn dieser Zeit trat Natalia aktiv als Solistin und Kammermusikerin auf und erweiterte ihre internationale Konzerttätigkeit.\n\nParallel zu ihrer Konzertkarriere setzte Natalia ihre pädagogische Arbeit mit hochbegabten Kindern an der Glinka-Schule fort, wo sie von 2017 bis 2023 tätig war.",
      en: "From 2019 to 2021 she studied chamber music at the St. Petersburg Conservatory with Prof. Inga Dzekzer as part of the postgraduate concert program.\n\nIn 2021 she won the Grand Prix at the Slonimsky Chamber Music Competition in Volgograd with her trio.\n\nDuring this period Natalia actively performed as a soloist and chamber musician and expanded her concert activity internationally.\n\nAlongside her concert career, Natalia continued her pedagogical work with gifted children at the Glinka School for Gifted Children, where she worked from 2017 to 2023.",
    },
  },
  {
    id: randomUUID(),
    year: "2023–",
    title: {
      de: "Künstlerische Weiterentwicklung",
      en: "Continued Professional Development",
      ru: "Дальнейшее профессиональное развитие",
    },
    text: {
      ru: "С 2023 года по 2025 Наталия обучалась по специальности «фортепианный дуэт» в Folkwang Universität der Künste в классе профессора Евгения Синайского.\n\nНаталия выступала в Германии, России, Швейцарии, Австрии, Эстонии, Израиле, Великобритании, США и других странах.\n\nОна активно работала как концертмейстер и ансамблист на различных фестивалях и мастер-классах, среди которых Nagold Musikfestival, проект Academists Венских филармоников в Musikverein Wien, Brahms-Festival Lübeck, а также Флейтовый фестиваль в Филармонии Еревана в Армении.\n\nТакже Наталия выступала в качестве ансамблевого партнёра лауреата Concours de Genève и работала приглашённым концертмейстером в Музыкальной высшей школе Любека.\n\nПомимо сольной и камерной карьеры Наталия регулярно выступает также в составе оркестров.",
      de: "Von 2023 bis 2025 studierte Natalia Klavierduo an der Folkwang Universität der Künste in der Klasse von Prof. Evgeny Sinaisky.\n\nNatalia konzertierte in Deutschland, Russland, der Schweiz, Österreich, Estland, Israel, Großbritannien, den USA, der Ukraine und weiteren Ländern.\n\nSie arbeitete aktiv als Korrepetitorin und Ensemblepartnerin bei verschiedenen Festivals und Meisterkursen, darunter das Nagolder Musikfestival, das Akademisten-Projekt der Wiener Philharmoniker im Musikverein Wien, das Brahms-Festival Lübeck sowie das Flötenfestival in der Philharmonie Jerewan in Armenien.\n\nAußerdem trat sie als Ensemblepartnerin eines Preisträgers des Concours de Genève auf und war als Gastkorrepetitorin an der Musikhochschule Lübeck tätig.\n\nNeben ihrer solistischen und kammermusikalischen Tätigkeit tritt Natalia auch als Orchestermusikerin auf.",
      en: "From 2023 to 2025 Natalia studied piano duo at the Folkwang University of the Arts in the class of Prof. Evgeny Sinaisky.\n\nNatalia has performed in Germany, Russia, Switzerland, Austria, Estonia, Israel, Great Britain, the USA, Ukraine, and other countries.\n\nShe actively worked as a collaborative pianist and ensemble partner at various festivals and masterclasses, including the Nagold Music Festival, the Academists Project of the Vienna Philharmonic at the Musikverein Wien, the Brahms Festival Lübeck, and the Flute Festival at the Yerevan Philharmonic in Armenia.\n\nShe also appeared as an ensemble partner of a prizewinner of the Concours de Genève and worked as a guest collaborative pianist at the Musikhochschule Lübeck.\n\nAlongside her solo and chamber music career, Natalia also performs as an orchestral pianist.",
    },
  },
];

// Fetch current settings to avoid overwriting other fields
const { data: artist, error: fetchErr } = await supabase
  .from("artists")
  .select("settings")
  .eq("id", ARTIST_ID)
  .single();

if (fetchErr) { console.error("Fetch error:", fetchErr); process.exit(1); }

const updatedSettings = { ...(artist.settings ?? {}), career };

const { error: updateErr } = await supabase
  .from("artists")
  .update({ settings: updatedSettings })
  .eq("id", ARTIST_ID);

if (updateErr) { console.error("Update error:", updateErr); process.exit(1); }

console.log(`✓ Inserted ${career.length} career entries (DE / EN / RU)`);
