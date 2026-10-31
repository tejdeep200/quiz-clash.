// Original, fixed-answer questions. Correct answer is first before display shuffling.
(function (root) {
const groups = {
Technology: [
['Easy', [
['What does CPU stand for?','Central processing unit','Computer power utility','Central program user','Control panel unit'],
['Which device is used to type text?','Keyboard','Monitor','Speaker','Projector'],
['Which company created the iPhone?','Apple','Nokia','Samsung','Sony'],
['What does a web browser open?','Web pages','Only spreadsheets','Only audio files','Printed books'],
['Which of these is an operating system?','Linux','HTML','Bluetooth','USB'],
['What does Wi-Fi primarily connect devices to wirelessly?','A local network','An electrical outlet','A satellite orbit','A printer cartridge']]],
['Medium', [
['What does HTML describe?','The structure of a web page','The speed of a processor','The charge of a battery','The resolution of a camera'],
['How many bits make one byte?','8','4','16','32'],
['Which protocol encrypts web traffic?','HTTPS','HTTP','FTP','Telnet'],
['What does RAM provide?','Temporary working memory','Permanent optical storage','Network encryption','Screen brightness'],
['What is a primary key used for in a database?','Uniquely identifying a row','Compressing every table','Encrypting all text','Sorting every column'],
['What does DNS translate domain names into?','IP addresses','Passwords','File extensions','HTML tags']]],
['Hard', [
['What is the time complexity of binary search on a sorted array?','O(log n)','O(n)','O(n squared)','O(n log n)'],
['Which data structure uses first in, first out?','Queue','Stack','Binary search tree','Hash set'],
['What does an HTTP 404 response mean?','Not found','Request succeeded','Server overloaded','Authentication required'],
['Which gate outputs true only when both inputs are true?','AND','OR','XOR','NOR'],
['Which property means a database transaction completes entirely or not at all?','Atomicity','Durability','Isolation','Consistency'],
['What is the decimal value of binary 1010?','10','8','12','14']]]
],
Science: [
['Easy', [
['Which planet is known as the Red Planet?','Mars','Venus','Jupiter','Mercury'],
['What is H2O commonly called?','Water','Salt','Hydrogen','Oxygen'],
['Which organ pumps blood around the body?','Heart','Liver','Lung','Kidney'],
['What force pulls objects toward Earth?','Gravity','Magnetism','Friction','Buoyancy'],
['How many legs does a spider have?','8','6','10','12'],
['Which gas do humans need for aerobic respiration?','Oxygen','Helium','Neon','Argon']]],
['Medium', [
['Which element has the symbol Fe?','Iron','Fluorine','Francium','Fermium'],
['What is the basic unit of life?','Cell','Atom','Organ','Molecule'],
['What is the SI unit of electrical resistance?','Ohm','Volt','Ampere','Watt'],
['Which part of a plant cell carries out photosynthesis?','Chloroplast','Nucleus','Ribosome','Mitochondrion'],
['What is the approximate speed of light in a vacuum?','300,000 km/s','300 km/s','3,000 km/s','30,000 km/s'],
['A substance with a pH of 2 is what?','Acidic','Neutral','Alkaline','Always a gas']]],
['Hard', [
['Which particle carries a negative electric charge?','Electron','Proton','Neutron','Photon'],
['Which law relates gas pressure and volume at constant temperature?','Boyle\u2019s law','Ohm\u2019s law','Hooke\u2019s law','Faraday\u2019s law'],
['What is the SI unit of capacitance?','Farad','Henry','Tesla','Weber'],
['How many chromosomes are in a typical human somatic cell?','46','23','44','48'],
['Which isotope is used in radiocarbon dating?','Carbon-14','Carbon-12','Uranium-238','Oxygen-16'],
['Which enzyme unwinds the DNA double helix during replication?','Helicase','Ligase','Amylase','Pepsin']]]
],
History: [
['Easy', [
['Which ancient civilization built the pyramids at Giza?','Egyptian','Roman','Aztec','Viking'],
['Who was the first president of the United States?','George Washington','Abraham Lincoln','John Adams','Thomas Jefferson'],
['In which year did Apollo 11 land humans on the Moon?','1969','1959','1979','1989'],
['Which city was buried by Mount Vesuvius in AD 79?','Pompeii','Athens','Carthage','Sparta'],
['Which country built the Great Wall?','China','Japan','India','Mongolia'],
['Who is associated with the theory of relativity?','Albert Einstein','Isaac Newton','Charles Darwin','Galileo Galilei']]],
['Medium', [
['In which year did World War II end?','1945','1939','1918','1950'],
['Which document was sealed in England in 1215?','Magna Carta','Bill of Rights','Treaty of Versailles','Domesday Book'],
['Who was the first woman to win a Nobel Prize?','Marie Curie','Rosalind Franklin','Ada Lovelace','Florence Nightingale'],
['Which empire used Constantinople as its capital?','Byzantine Empire','Mongol Empire','Inca Empire','Persian Achaemenid Empire'],
['In which year did the Berlin Wall fall?','1989','1979','1991','1961'],
['Which civilization developed cuneiform writing?','Sumerian','Maya','Roman','Phoenician']]],
['Hard', [
['Which treaties ended the Thirty Years\u2019 War in 1648?','Peace of Westphalia','Treaty of Utrecht','Peace of Augsburg','Treaty of Tordesillas'],
['Who led the Haitian Revolution and became governor-general in 1801?','Toussaint Louverture','Sim\u00f3n Bol\u00edvar','Jos\u00e9 de San Mart\u00edn','Miguel Hidalgo'],
['In which year did the Battle of Hastings take place?','1066','1215','1453','1016'],
['Which dynasty ruled China when the Forbidden City was first built?','Ming','Qing','Han','Tang'],
['Which ruler founded the Maurya Empire?','Chandragupta Maurya','Ashoka','Akbar','Kanishka'],
['Which empire did the Ottoman conquest of Constantinople end in 1453?','Byzantine Empire','Holy Roman Empire','Mongol Empire','Sasanian Empire']]]
],
Geography: [
['Easy', [
['What is the capital of Japan?','Tokyo','Kyoto','Osaka','Seoul'],
['Which ocean is the largest by surface area?','Pacific','Atlantic','Indian','Arctic'],
['On which continent is Kenya?','Africa','Asia','Europe','South America'],
['Which country is home to the city of Sydney?','Australia','New Zealand','Canada','South Africa'],
['Which country has a maple leaf on its flag?','Canada','Brazil','Sweden','Mexico'],
['Which continent contains the South Pole?','Antarctica','Europe','Asia','Australia']]],
['Medium', [
['What is the capital of Australia?','Canberra','Sydney','Melbourne','Perth'],
['Which desert is the largest hot desert?','Sahara','Gobi','Kalahari','Atacama'],
['Which river flows through Paris?','Seine','Thames','Danube','Rhine'],
['Which country is completely surrounded by South Africa?','Lesotho','Eswatini','Botswana','Namibia'],
['Which strait separates Spain from Morocco?','Strait of Gibraltar','Bering Strait','Strait of Hormuz','Strait of Malacca'],
['Which mountain is highest above mean sea level?','Mount Everest','K2','Kilimanjaro','Denali']]],
['Hard', [
['Which lake is the deepest in the world?','Lake Baikal','Lake Victoria','Lake Superior','Lake Tanganyika'],
['What is the capital of Bhutan?','Thimphu','Kathmandu','Dhaka','Vientiane'],
['Which country contains the Atacama Desert\u2019s core region?','Chile','Peru','Argentina','Bolivia'],
['Which sea lies between Europe and Africa?','Mediterranean Sea','Baltic Sea','Arabian Sea','Caribbean Sea'],
['Which country has coastlines on both the Caspian Sea and Persian Gulf?','Iran','Iraq','Turkey','Pakistan'],
['Which line of latitude lies at approximately 23.5 degrees south?','Tropic of Capricorn','Tropic of Cancer','Arctic Circle','Equator']]]
],
Sports: [
['Easy', [
['Which sport uses a puck?','Ice hockey','Tennis','Golf','Cricket'],
['How many players per team start on the field in association football?','11','9','10','12'],
['In which sport do players shoot at a hoop?','Basketball','Rugby','Baseball','Volleyball'],
['Which sport is played at Wimbledon?','Tennis','Cricket','Badminton','Squash'],
['How many rings are on the Olympic symbol?','5','4','6','7'],
['Which swimming stroke is named after an insect?','Butterfly','Backstroke','Breaststroke','Freestyle']]],
['Medium', [
['How many points is a free throw worth in basketball?','1','2','3','4'],
['What is the length of a marathon?','42.195 km','40 km','26 km','50 km'],
['In tennis, what follows deuce when a player wins the next point?','Advantage','Game immediately','Love','Set immediately'],
['How many balls are bowled in a standard cricket over?','6','4','5','8'],
['In golf, what is one stroke under par called?','Birdie','Bogey','Eagle','Albatross'],
['How many players per team are on court in indoor volleyball?','6','5','7','8']]],
['Hard', [
['Which country won the first men\u2019s football World Cup in 1930?','Uruguay','Brazil','Argentina','Italy'],
['How many events make up a decathlon?','10','7','8','12'],
['In snooker, how many points is the black ball worth?','7','5','6','8'],
['What is a perfect score in ten-pin bowling?','300','200','250','360'],
['Which fencing weapon allows the entire body as a target?','\u00c9p\u00e9e','Foil','Sabre','All three'],
['In rugby union, how many points is a try worth?','5','3','4','6']]]
],
'General Knowledge': [
['Easy', [
['How many sides does a hexagon have?','6','5','7','8'],
['Which instrument normally has 88 keys?','Piano','Guitar','Violin','Flute'],
['What is the main ingredient in guacamole?','Avocado','Tomato','Potato','Cucumber'],
['How many days are in a leap year?','366','365','364','367'],
['Which shape has three sides?','Triangle','Square','Pentagon','Circle'],
['How many minutes are in one hour?','60','100','30','90']]],
['Medium', [
['Who wrote Pride and Prejudice?','Jane Austen','Charlotte Bront\u00eb','George Eliot','Mary Shelley'],
['What is the smallest prime number?','2','0','1','3'],
['Which artist painted the Mona Lisa?','Leonardo da Vinci','Michelangelo','Raphael','Vincent van Gogh'],
['What is 15 percent of 200?','30','15','25','40'],
['Which language is the word bonjour from?','French','Italian','Spanish','German'],
['How many strings does a standard violin have?','4','5','6','8']]],
['Hard', [
['Who wrote the novel The Trial?','Franz Kafka','Hermann Hesse','Thomas Mann','Albert Camus'],
['Which number is represented by the Roman numeral XL?','40','60','90','15'],
['In music, how many semitones are in an octave?','12','8','10','14'],
['Which philosopher wrote The Republic?','Plato','Aristotle','Socrates','Epicurus'],
['What is the sum of the interior angles of a pentagon?','540 degrees','360 degrees','720 degrees','900 degrees'],
['Which word means a word or phrase that reads the same backward?','Palindrome','Anagram','Homophone','Acronym']]]
]
};
const questions = Object.entries(groups).flatMap(([category, levels]) => levels.flatMap(([difficulty, rows]) => rows.map((r, i) => ({id: `${category}-${difficulty}-${i}`, category, difficulty, text:r[0], answers:r.slice(1), correct:0}))));
if (typeof module !== 'undefined') module.exports = questions;
else root.QUIZ_QUESTIONS = questions;
})(globalThis);
