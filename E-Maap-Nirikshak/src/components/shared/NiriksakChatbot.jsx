import { useState, useRef, useEffect, useCallback } from 'react';
import useAppStore from '../../store/useAppStore.js';

/* ─────────────────────────────────────────────────────────────────
   CONFIG & API
───────────────────────────────────────────────────────────────── */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/* ─────────────────────────────────────────────────────────────────
   22 SCHEDULED INDIAN LANGUAGES + ENGLISH
───────────────────────────────────────────────────────────────── */
const LANGS = {
  en:  { label:'English',    native:'English',     flag:'🇬🇧', script:'latin',     budget:1500, prompt:'Respond ONLY in English. Be detailed, structured, and cite relevant sections of the Legal Metrology Act, 2009 and Rules.', welcome:"Namaste! 🙏 I'm **Niriksak AI**, your legal metrology assistant.\n\nAsk me anything about the **Legal Metrology Act, 2009**, verification procedures, penalties, or compliance! You can also **attach images** of instruments, certificates, or packaged commodity labels for instant visual compliance analysis.", ph:'Ask about Legal Metrology Act, penalties, or attach photo…', chips:['Re-verification period for weighbridges?','Penalties under Legal Metrology Act?','Mandatory declarations on packaged commodities?','Who can conduct verification inspections?'], choose:'Choose your language', powered:'Powered by Gemini 2.5 Flash • Legal Metrology Act, 2009', ask:'Quick queries', online:'Legal Metrology Expert • Online' },
  hi:  { label:'Hindi',      native:'हिंदी',        flag:'🇮🇳', script:'devanagari', budget:3000, prompt:'केवल हिंदी में विस्तृत, सटीक और धारा-सहित उत्तर दें। संक्षेप नहीं — संपूर्ण विधिक जानकारी प्रदान करें।', welcome:"नमस्ते! 🙏 मैं **निरीक्षक AI** हूँ — आपका कानूनी माप-विज्ञान सहायक।\n\nविधिक माप-विज्ञान अधिनियम 2009, सत्यापन, दंड या नियमों के बारे में पूछें! आप उपकरणों या पैकेजिंग लेबल की **तस्वीर भी संलग्न (Attach)** कर सकते हैं।", ph:'कानूनी माप-विज्ञान, दंड, सत्यापन या फोटो अपलोड करें…', chips:['वेब्रिज पुनः-सत्यापन की समयावधि क्या है?','अधिनियम के तहत प्रमुख दंड क्या हैं?','पैकेज्ड कमोडिटी पर अनिवार्य घोषणाएं?','निरीक्षण कौन अधिकारी कर सकता है?'], choose:'भाषा चुनें', powered:'Gemini 2.5 Flash द्वारा संचालित • विधिक माप-विज्ञान अधिनियम, 2009', ask:'त्वरित प्रश्न', online:'विधिक माप-विज्ञान विशेषज्ञ • ऑनलाइन' },
  mr:  { label:'Marathi',    native:'मराठी',        flag:'🟠', script:'devanagari', budget:3000, prompt:'फक्त मराठीत सविस्तर, अचूक आणि कलमांसह उत्तर द्या. संपूर्ण कायदेशीर माहिती द्या.', welcome:"नमस्कार! 🙏 मी **निरीक्षक AI** — कायदेशीर मेट्रोलॉजी सहाय्यक.\n\nकायदेशीर मेट्रोलॉजी कायदा 2009, दंड, सत्यापन याबद्दल काहीही विचारा! आपण उपकरणांचा किंवा पॅकिंगचा **फोटो देखील जोडू (Attach)** शकता.", ph:'कायदेशीर मेट्रोलॉजी, दंड, सत्यापन किंवा फोटो जोडा…', chips:['वेब्रिज पुनर्सत्यापन कालावधी किती असतो?','कायद्यांतर्गत कोणते दंड आहेत?','पॅकेज केलेल्या वस्तूवर काय नियम आहेत?','तपासणी कोण करू शकतो?'], choose:'भाषा निवडा', powered:'Gemini 2.5 Flash द्वारे • कायदेशीर मेट्रोलॉजी कायदा, 2009', ask:'त्वरित प्रश्न', online:'कायदेशीर मेट्रोलॉजी तज्ञ • ऑनलाइन' },
  bn:  { label:'Bengali',    native:'বাংলা',        flag:'🟡', script:'bengali',    budget:2800, prompt:'শুধুমাত্র বাংলায় বিস্তারিত ও ধারাভিত্তিক উত্তর দিন। সম্পূর্ণ আইনি তথ্য প্রদান করুন।', welcome:"নমস্কার! 🙏 আমি **নিরীক্ষক AI** — আইনি পরিমাপবিদ্যা সহকারী।\n\nআইনি পরিমাপবিদ্যা আইন ২০০৯, যাচাইকরণ, জরিমানা সম্পর্কে যেকোনো প্রশ্ন করুন! আপনি যন্ত্র বা প্যাকেটের ছবিও আপলোড করতে পারেন।", ph:'আইনি পরিমাপবিদ্যা, জরিমানা, ছবি যোগ করুন…', chips:['ওজনসেতুর পুনঃযাচাইকরণ মেয়াদ কত?','আইনে জরিমানা কী কী?','মোড়কজাত পণ্যে আবশ্যক ঘোষণা কী?','পরিদর্শন কে করতে পারেন?'], choose:'ভাষা বেছে নিন', powered:'Gemini 2.5 Flash দ্বারা • আইনি পরিমাপবিদ্যা আইন, ২০০৯', ask:'জনপ্রিয় প্রশ্ন', online:'আইনি পরিমাপবিদ্যা বিশেষজ্ঞ • অনলাইন' },
  te:  { label:'Telugu',     native:'తెలుగు',       flag:'🔵', script:'south',      budget:2800, prompt:'తెలుగులో మాత్రమే వివరంగా, స్పష్టంగా సమాధానం ఇవ్వండి. చట్టపరమైన సెక్షన్లను పేర్కొనండి.', welcome:"నమస్కారం! 🙏 నేను **నిరీక్షక్ AI** — చట్టపరమైన మెట్రాలజీ సహాయకుడు.\n\nలీగల్ మెట్రాలజీ చట్టం, ధృవీకరణ, జరిమానాల గురించి అడగండి! పరికరాల ఫోటోలను కూడా జోడించవచ్చు.", ph:'మెట్రాలజీ చట్టం, జరిమానాలు, ఫోటో జోడించండి…', chips:['వేబ్రిడ్జ్ పునఃధృవీకరణ కాలపరిమితి?','చట్టం ప్రకారం జరిమానాలు ఏమిటి?','ప్యాక్ చేసిన వస్తువులపై తప్పనిసరి వివరాలు?','తనిఖీ ఎవరు చేయవచ్చు?'], choose:'భాష ఎంచుకోండి', powered:'Gemini 2.5 Flash ద్వారా • మెట్రాలజీ చట్టం, 2009', ask:'ప్రశ్నలు', online:'మెట్రాలజీ నిపుణుడు • ఆన్‌లైన్' },
  ta:  { label:'Tamil',      native:'தமிழ்',        flag:'🔴', script:'south',      budget:2800, prompt:'தமிழில் மட்டுமே விரிவான, தெளிவான பதில் தரவும். சட்டப் பிரிவுகளைக் குறிப்பிடவும்.', welcome:"வணக்கம்! 🙏 நான் **நிரீட்சக் AI** — சட்ட அளவியல் உதவியாளர்.\n\nசட்ட அளவியல் சட்டம் 2009, சரிபார்ப்பு, அபராதம் பற்றி கேளுங்கள்! புகைப்படங்களையும் இணைக்கலாம்.", ph:'சட்ட அளவியல், அபராதம், புகைப்படம் இணைக்கவும்…', chips:['வெயிப்பிரிட்ஜ் மறு சரிபார்ப்பு காலம்?','சட்டத்தின் கீழ் அபராதங்கள் என்ன?','பாக்கெட் பொருட்களில் கட்டாய அறிவிப்புகள்?','ஆய்வு செய்ய அதிகாரம் உள்ளவர் யார்?'], choose:'மொழி தேர்ந்தெடுக்கவும்', powered:'Gemini 2.5 Flash மூலம் • சட்ட அளவியல் சட்டம், 2009', ask:'கேள்விகள்', online:'அளவியல் நிபுணர் • ஆன்லைன்' },
  gu:  { label:'Gujarati',   native:'ગુજરાતી',      flag:'🟢', script:'gujarati',   budget:2500, prompt:'ફક્ત ગુજરાતીમાં વિગતવાર અને કલમો સાથે ઉત્તર આપો.', welcome:"નમસ્તે! 🙏 હું **નિરીક્ષક AI** — કાનૂની માપ-વિજ્ઞાન સહાયક.\n\nમાપ-વિજ્ઞાન અધિનિયમ, ચકાસણી, દંડ વિશે કંઈ પણ પૂછો! ફોટો પણ જોડી શકો છો.", ph:'કાનૂની માપ-વિજ્ઞાન, દંડ અથવા ફોટો જોડો…', chips:['વેઇબ્રિજ પુનઃચકાસણી સમયગાળો?','અધિનિયમ હેઠળ દંડ શું છે?','પેક્ડ ચીજવસ્તુઓ પર ફરજિયાત ઘોષણાઓ?','નિરીક્ષણ કોણ કરી શકે?'], choose:'ભાષા પસંદ કરો', powered:'Gemini 2.5 Flash દ્વારા • માપ-વિજ્ઞાન અધિનિયમ, 2009', ask:'પૂછો', online:'માપ-વિજ્ઞાન નિષ્ણાત • ઑનલાઇન' },
  kn:  { label:'Kannada',    native:'ಕನ್ನಡ',         flag:'🟤', script:'south',      budget:2800, prompt:'ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ವಿವರವಾಗಿ ಉತ್ತರಿಸಿ. ಸಂಬಂಧಿತ ಕಾನೂನು ಕಲಮುಗಳನ್ನು ಉಲ್ಲೇಖಿಸಿ.', welcome:"ನಮಸ್ಕಾರ! 🙏 ನಾನು **ನಿರೀಕ್ಷಕ AI** — ಕಾನೂನು ಮಾಪನಶಾಸ್ತ್ರ ಸಹಾಯಕ.\n\nಕಾಯ್ದೆ, ಪರಿಶೀಲನೆ, ದಂಡ ಬಗ್ಗೆ ಕೇಳಿ! ಫೋಟೋವನ್ನು ಸಹ ಲಗತ್ತಿಸಬಹುದು.", ph:'ಮಾಪನಶಾಸ್ತ್ರ, ದಂಡ, ಪರಿಶೀಲನೆ, ಫೋಟೋ ಲಗತ್ತಿಸಿ…', chips:['ವೇಬ್ರಿಡ್ಜ್ ಮರು-ಪರಿಶೀಲನೆ ಅವಧಿ?','ಕಾಯ್ದೆಯಡಿ ದಂಡಗಳು ಯಾವುವು?','ಪ್ಯಾಕ್ ಮಾಡಿದ ಸರಕುಗಳ ಮೇಲಿನ ನಿಯಮಗಳು?','ತಪಾಸಣೆ ಯಾರು ಮಾಡಬಹುದು?'], choose:'ಭಾಷೆ ಆರಿಸಿ', powered:'Gemini 2.5 Flash ಮೂಲಕ • ಮಾಪನಶಾಸ್ತ್ರ ಕಾಯ್ದೆ, 2009', ask:'ಪ್ರಶ್ನೆಗಳು', online:'ಮಾಪನಶಾಸ್ತ್ರ ತಜ್ಞ • ಆನ್‌ಲೈನ್' },
  ml:  { label:'Malayalam',  native:'മലയാളം',       flag:'🌴', script:'south',      budget:2800, prompt:'മലയാളത്തിൽ മാത്രം വിശദമായി ഉത്തരം നൽകുക. നിയമ വകുപ്പുകൾ പരാമർശിക്കുക.', welcome:"നമസ്കാരം! 🙏 ഞാൻ **നിരീക്ഷക് AI** — നിയമ മെട്രോളജി സഹായി.\n\nനിയമം, പരിശോധന, പിഴ എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ! ഫോട്ടോയും അറ്റാച്ചുചെയ്യാം.", ph:'നിയമ മെട്രോളജി, പിഴ, ഫോട്ടോ…', chips:['വേബ്രിഡ്ജ് പുനഃപരിശോധനാ കാലാവധി?','നിയമപ്രകാരമുള്ള പിഴകൾ?','പാക്കേജ്ഡ് ഉൽപ്പന്നങ്ങളിലെ നിബന്ധനകൾ?','പരിശോധന ആർക്കൊക്കെ നടത്താം?'], choose:'ഭാഷ തിരഞ്ഞെടുക്കൂ', powered:'Gemini 2.5 Flash • മെട്രോളജി നിയമം, 2009', ask:'ചോദിക്കൂ', online:'മെട്രോളജി വിദഗ്ധൻ • ഓൺലൈൻ' },
  pa:  { label:'Punjabi',    native:'ਪੰਜਾਬੀ',        flag:'🌾', script:'gurmukhi',   budget:2500, prompt:'ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਵਿਸਥਾਰ ਨਾਲ ਜਵਾਬ ਦਿਓ। ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਦਰਜ ਕਰੋ।', welcome:"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 🙏 ਮੈਂ **ਨਿਰੀਕਸ਼ਕ AI** — ਕਾਨੂੰਨੀ ਮਾਪ-ਵਿਗਿਆਨ ਸਹਾਇਕ।\n\nਐਕਟ, ਜਾਂਚ, ਜੁਰਮਾਨੇ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ! ਫੋਟੋ ਵੀ ਅਟੈਚ ਕਰ ਸਕਦੇ ਹੋ।", ph:'ਕਾਨੂੰਨੀ ਮਾਪ-ਵਿਗਿਆਨ, ਜੁਰਮਾਨੇ, ਫੋਟੋ ਅਟੈਚ ਕਰੋ…', chips:['ਵੇਬ੍ਰਿਜ ਦੁਬਾਰਾ ਜਾਂਚ ਦਾ ਸਮਾਂ?','ਐਕਟ ਅਧੀਨ ਜੁਰਮਾਨੇ ਕੀ ਹਨ?','ਪੈਕਡ ਸਮਾਨ ਉੱਤੇ ਲਾਜ਼ਮੀ ਲੇਬਲ?','ਨਿਰੀਖਣ ਕੌਣ ਕਰ ਸਕਦਾ ਹੈ?'], choose:'ਭਾਸ਼ਾ ਚੁਣੋ', powered:'Gemini 2.5 Flash ਦੁਆਰਾ • ਮਾਪ-ਵਿਗਿਆਨ ਐਕਟ, 2009', ask:'ਪੁੱਛੋ', online:'ਮਾਪ-ਵਿਗਿਆਨ ਮਾਹਿਰ • ਔਨਲਾਈਨ' },
  ur:  { label:'Urdu',       native:'اردو',           flag:'☪️', script:'arabic',     budget:3000, prompt:'صرف اردو میں تفصیلی اور مستند جواب دیں۔ متعلقہ دفعات کا حوالہ دیں۔', welcome:"السلام علیکم! 🙏 میں **نریکشک AI** ہوں — قانونی میٹرولوجی معاون۔\n\nایکٹ، تصدیق، جرمانوں کے بارے میں کچھ بھی پوچھیں! آپ تصویر بھی منسلک کر سکتے ہیں۔", ph:'قانونی میٹرولوجی، جرمانے، تصویر منسلک کریں…', chips:['ویب برج دوبارہ تصدیق کا وقت؟','ایکٹ کے تحت کیا جرمانے ہیں؟','پیک شدہ اشیاء پر لازمی شرائط؟','معائنہ کون کر سکتا ہے؟'], choose:'زبان منتخب کریں', powered:'Gemini 2.5 Flash • قانونی میٹرولوجی ایکٹ، 2009', ask:'پوچھیں', online:'میٹرولوجی ماہر • آن لائن' },
  or:  { label:'Odia',       native:'ଓଡ଼ିଆ',         flag:'🔶', script:'odia',       budget:2800, prompt:'ଓଡ଼ିଆରେ ବିସ୍ତାରରେ ଉତ୍ତର ଦିଅନ୍ତୁ।', welcome:"ନମସ୍କାର! 🙏 ମୁଁ **ନିରୀକ୍ଷକ AI** — ଆଇନ ମାପ-ବିଜ୍ଞାନ ସହାୟକ।\n\nଆଇନ, ଯାଞ୍ଚ, ଦଣ୍ଡ ବିଷୟରେ ପଚାରନ୍ତୁ! ଫଟୋ ମଧ୍ୟ ଯୋଡ଼ିପାରିବେ।", ph:'ଆଇନ ମାପ-ବିଜ୍ଞାନ, ଦଣ୍ଡ, ଫଟୋ…', chips:['ୱେବ୍ରିଜ୍ ଯାଞ୍ଚ ସମୟସୀମା?','ଆଇନ ଅନୁଯାୟୀ ଦଣ୍ଡ କ\'ଣ?','ପ୍ୟାକେଜ୍ ସାମଗ୍ରୀ ଉପରେ ନିୟମ?','ଯାଞ୍ଚ କିଏ କରିପାରିବେ?'], choose:'ଭାଷା ବାଛନ୍ତୁ', powered:'Gemini 2.5 Flash ଦ୍ୱାରା • 2009', ask:'ପଚାରନ୍ତୁ', online:'ଆଇନ ବିଶେଷଜ୍ଞ • ଅନଲାଇନ' },
  as:  { label:'Assamese',   native:'অসমীয়া',       flag:'🌿', script:'bengali',    budget:2800, prompt:'অসমীয়াত বিস্তাৰিত উত্তৰ দিয়ক।', welcome:"নমস্কাৰ! 🙏 মই **নিৰীক্ষক AI** — আইনী ওজন-জোখ সহায়ক।\n\nআইনী ওজন-জোখ আইন, পৰীক্ষণ, জৰিমনা বিষয়ে সোধক! ফটোও আপলোড কৰিব পাৰে।", ph:'আইনী ওজন-জোখ, জৰিমনা, ফটো…', chips:['ৱেইব্ৰিজ পুনৰ-পৰীক্ষণৰ সময়?','জৰিমনা কি কি?','পেকেজিং নিয়ম কি?','পৰীক্ষণ কোনে কৰিব পাৰে?'], choose:'ভাষা বাছক', powered:'Gemini 2.5 Flash দ্বাৰা • 2009', ask:'সোধক', online:'বিশেষজ্ঞ • অনলাইন' },
  mai: { label:'Maithili',   native:'मैथिली',        flag:'🔷', script:'devanagari', budget:3000, prompt:'मैथिलीमे विस्तारसँ उत्तर दिअ।', welcome:"प्रणाम! 🙏 हम **निरीक्षक AI** छी — विधिक माप-विज्ञान सहायक।\n\nअधिनियम, सत्यापन, दण्डक बिषयमे किछु पुछू!", ph:'विधिक माप-विज्ञान, दण्ड, सत्यापन…', chips:['वेब्रिजक सत्यापन?','दण्ड की?','निरीक्षण के?','पंजीकरण कागज?'], choose:'भाषा चुनू', powered:'Gemini 2.5 Flash द्वारा • 2009', ask:'पुछू', online:'विशेषज्ञ • ऑनलाइन' },
  kok: { label:'Konkani',    native:'कोंकणी',         flag:'🐚', script:'devanagari', budget:3000, prompt:'फक्त कोंकणीत विस्तृत जाप दी.', welcome:"नमस्कार! 🙏 हांव **निरीक्षक AI** — कायदेशीर मापशास्त्र मदतगार।\n\nकायदो, पडताळणी, दंड विशीं विचार! फोटोय जोडूंक शकतात.", ph:'कायदेशीर मापशास्त्र, दंड, फोटो…', chips:['वेब्रिजाची पडताळणी?','दंड कितें?','पॅकिंग नेम कितें?','निरीक्षण कोण करता?'], choose:'भाशा निवड', powered:'Gemini 2.5 Flash वरवीं • 2009', ask:'विचार', online:'तज्ञ • ऑनलाइन' },
  ne:  { label:'Nepali',     native:'नेपाली',         flag:'🏔️', script:'devanagari', budget:3000, prompt:'नेपालीमा मात्र विस्तारमा उत्तर दिनुस्।', welcome:"नमस्ते! 🙏 म **निरीक्षक AI** हुँ — कानूनी नाप-जाँच सहायक।\n\nऐन, प्रमाणीकरण, जरिवाना बारे सोध्नुस्! फोटो पनि अपलोड गर्न सक्नुहुन्छ।", ph:'कानूनी नाप-जाँच, जरिवाना, फोटो…', chips:['वेब्रिज प्रमाणीकरण समय?','जरिवाना के कस्तो छ?','प्याकिङ नियम के हो?','निरीक्षण कसले गर्छ?'], choose:'भाषा छान्नुस्', powered:'Gemini 2.5 Flash • 2009', ask:'सोध्नुस्', online:'विशेषज्ञ • अनलाइन' },
  doi: { label:'Dogri',      native:'डोगरी',          flag:'🏵️', script:'devanagari', budget:3000, prompt:'सिर्फ डोगरी च विस्तार कन्नै जवाब दिओ।', welcome:"नमस्कार! 🙏 मैं **निरीक्षक AI** आं — कानूनी माप-विज्ञान सहायक।\n\nकानून, जांच, जुर्माने बारे पुच्छो!", ph:'कानूनी माप-विज्ञान, जुर्माने, जांच…', chips:['वेब्रिज जांच?','जुर्माने क्या?','निरीक्षण कोण?','कागज पत्र?'], choose:'भाशा चुनो', powered:'Gemini 2.5 Flash • 2009', ask:'पुच्छो', online:'माहिर • ऑनलाइन' },
  sa:  { label:'Sanskrit',   native:'संस्कृतम्',      flag:'📜', script:'devanagari', budget:3000, prompt:'संस्कृतेन सम्पूर्णतया विस्तृतम् उत्तरं ददातु।', welcome:"नमस्ते! 🙏 अहम् **निरीक्षक AI** अस्मि — वैधिक मापन-विज्ञान सहायकः।\n\nअधिनियमे, सत्यापने, दण्डे च किमपि पृच्छतु!", ph:'वैधिक मापन-विज्ञान, दण्डः, सत्यापनम्…', chips:['वेब्रिजस्य सत्यापनम्?','दण्डः कः?','निरीक्षणं कः करोति?','पञ्जीकरणाय पत्राणि?'], choose:'भाषां वृणोतु', powered:'Gemini 2.5 Flash • 2009', ask:'पृच्छतु', online:'विशेषज्ञः • ऑनलाइन' },
  mni: { label:'Manipuri',   native:'মেইতেই',         flag:'🌸', script:'bengali',    budget:2800, prompt:'মেইতেইলোনদা থুংনা পিথোকউ।', welcome:"নমস্কার! 🙏 ঐ **নিরীক্ষক AI** — লৈগৌথোকপা মেত্রোলজি হেল্পার।\n\nমেত্রোলজি আইন, ফাইন, চেকিং বিষয়ে সোধক!", ph:'মেত্রোলজি লাইরিক, ফাইন, চেকিং…', chips:['ৱেব্রিজ ভেরিফিকেশন?','ফাইন কদাইনো?','ইন্সপেকশন কনা?','ডকুমেন্ট?'], choose:'লোন চৎপিউ', powered:'Gemini 2.5 Flash • 2009', ask:'দম্মিউ', online:'এক্সপার্ট • অনলাইন' },
  sd:  { label:'Sindhi',     native:'سنڌي',            flag:'🌊', script:'arabic',     budget:3000, prompt:'صرف سنڌيءَ ۾ تفصيل سان جواب ڏيو.', welcome:"السلام عليڪم! 🙏 مان **نيريڪشڪ AI** — قانوني ماپ-سائنس مددگار۔\n\nايڪٽ، تصديق، جرمانن بابت ڪجهه به پڇو!", ph:'قانوني ماپ-سائنس، جرمانا…', chips:['ويبرج تصديق?','جرمانا ڇا?','معائنو ڪير?','رجسٽريشن دستاويز?'], choose:'ٻولي چونڊيو', powered:'Gemini 2.5 Flash • 2009', ask:'پڇو', online:'ماهر • آن لائن' },
  ks:  { label:'Kashmiri',   native:'کٲشُر',           flag:'❄️', script:'arabic',     budget:3000, prompt:'سِرف کٲشُری زبانہ مَنز تفصیل سِتہِ جواب دیو.', welcome:"السلام علیکم! 🙏 بہٕ **نریکشک AI** چھُس — قانونی ناپ-سائنس مددگار۔\n\nقانون، تصدیق، جرمانن بابت پُچھ!", ph:'قانونی ناپ-سائنس، جرمانہ…', chips:['ویبرِج تصدیق?','جرمانہ کیا?','معائنہ کُس?','کاغذات?'], choose:'زبان چُنو', powered:'Gemini 2.5 Flash • 2009', ask:'پُچھ', online:'ماہر • آن لائن' },
  sat: { label:'Santali',    native:'ᱥᱟᱱᱛᱟᱲᱤ',       flag:'🌳', script:'ol-chiki',   budget:3000, prompt:'Try to respond in Santali (Ol Chiki) or clear Hindi/English.', welcome:"Johar! 🙏 Am **Nirikshak AI** — Legal Metrology assistant.\n\nAsk about Legal Metrology Act, verification, penalties!", ph:'Ask in Santali, Hindi or English…', chips:['Weighbridge re-verification?','Penalties under the Act?','Who can inspect?','Documents for registration?'], choose:'ᱦᱚᱱᱟᱛᱮ ᱥᱮᱞᱮᱫ', powered:'Gemini 2.5 Flash • 2009', ask:'Ask', online:'Expert • Online' },
  bo:  { label:'Bodo',       native:'बड़ो',            flag:'🎋', script:'devanagari', budget:3000, prompt:'Respond in Bodo or clear Hindi/English.', welcome:"नमस्कार! 🙏 आं **निरीक्षक AI** — कानूनी माप-बिज्ञान सहायक।\n\nकानूनी माप-बिज्ञान ऐन, जाँच, जुर्मानाखौ पुरायो!", ph:'कानूनी माप-बिज्ञान, जुर्माना…', chips:['वेब्रिज जाँच?','जुर्माना मा?','दाहाइ जाँच कोण?','कागज?'], choose:'भाखा सायख', powered:'Gemini 2.5 Flash • 2009', ask:'पुरायो', online:'बिसेसोज्ञ • ऑनलाइन' },
};

const SYS_PROMPT = (langPrompt) => `You are "Niriksak AI" — the premier AI Legal Metrology Assistant for the E-Maap Nirikshak platform, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

DOMAINS OF EXPERTISE:
1. Legal Metrology Act, 2009 (Sections, Definitions, Enforcement, Appeals, Offenses & Compoundability)
2. Legal Metrology (General) Rules, 2011 (Verification intervals, permissible errors, sealing, stamp markings)
3. Legal Metrology (Packaged Commodities) Rules, 2011 (Mandatory declarations: Name/Address of Manufacturer/Packer, Common/Generic Name, Net Quantity in standard units, Month & Year of Manufacture/Import, MRP incl. of all taxes, Consumer Care details)
4. Jan Vishwas (Amendment of Provisions) Act, 2023 (Decriminalization of first offenses, revised penalty slabs)
5. Model Approval (Section 22), Stamping & Verification Certificate issuance, GATC and LMO jurisdiction.

IMAGE & DOCUMENT ANALYSIS (MULTIMODAL):
- When the user uploads or attaches an image (photo of weighing instrument, weighbridge, verification certificate, inspection stamping, or packaged commodity label):
  - Identify the exact object/instrument/label shown.
  - Check for mandatory compliance marks, stamp impressions, serial numbers, capacity, readability, and net quantity declarations.
  - State clearly whether it complies with the Legal Metrology Rules or if violations exist.
  - Cite the specific sections and rules applicable.

LANGUAGE DIRECTIVE:
${langPrompt}

FORMATTING STANDARDS:
- Always use **bold** for Section numbers, Acts, penalty figures, and critical deadlines.
- Use structured bullet points or numbered lists for readability.
- Maintain an authoritative, helpful, and courteous government-expert tone.
- Never truncate or omit essential compliance criteria.`;

/* ─────────────────────────────────────────────────────────────────
   MARKDOWN RENDERER
───────────────────────────────────────────────────────────────── */
function parseInline(text) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index} style={{fontWeight:700,color:'#f8fafc'}}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index} style={{color:'#c7d2fe'}}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={m.index} style={{background:'rgba(124,58,237,.25)',padding:'1px 5px',borderRadius:4,fontFamily:'monospace',fontSize:12,color:'#a78bfa'}}>{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function renderMD(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, ''));
      out.push(<ol key={`ol${i}`} style={{margin:'4px 0 4px 16px',display:'flex',flexDirection:'column',gap:3}}>{items.map((it,j)=><li key={j} style={{lineHeight:1.6}}>{parseInline(it)}</li>)}</ol>);
      continue;
    }
    if (/^[-•*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-•*]\s/, ''));
      out.push(<ul key={`ul${i}`} style={{margin:'4px 0 4px 14px',display:'flex',flexDirection:'column',gap:3}}>{items.map((it,j)=><li key={j} style={{lineHeight:1.6,listStyleType:'disc'}}>{parseInline(it)}</li>)}</ul>);
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      out.push(<div key={`h${i}`} style={{fontWeight:700,fontSize:14,color:'#a5b4fc',margin:'8px 0 3px'}}>{parseInline(line.replace(/^#+\s/,''))}</div>);
      i++; continue;
    }
    if (line.trim() === '') { out.push(<div key={`s${i}`} style={{height:4}} />); i++; continue; }
    out.push(<div key={`p${i}`} style={{lineHeight:1.6,margin:'2px 0'}}>{parseInline(line)}</div>);
    i++;
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────
   ROBOT AVATAR (SVG)
───────────────────────────────────────────────────────────────── */
function RobotSVG({ size = 28, glow = false }) {
  const id = `rg_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={glow?{filter:'drop-shadow(0 0 10px rgba(139,92,246,.7))'}:{}}>
      <defs>
        <linearGradient id={`${id}a`} x1="16" y1="14" x2="48" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#6366f1"/>
        </linearGradient>
        <linearGradient id={`${id}b`} x1="14" y1="44" x2="50" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed"/><stop offset="1" stopColor="#4f46e5"/>
        </linearGradient>
      </defs>
      <rect x="16" y="14" width="32" height="26" rx="7" fill={`url(#${id}a)`}/>
      <line x1="32" y1="14" x2="32" y2="6" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="32" cy="5" r="3.5" fill="#e0e7ff"/>
      <circle cx="23" cy="25" r="4.5" fill="#0f172a"/>
      <circle cx="41" cy="25" r="4.5" fill="#0f172a"/>
      <circle cx="24.5" cy="23.5" r="2" fill="#38bdf8"/>
      <circle cx="42.5" cy="23.5" r="2" fill="#38bdf8"/>
      <rect x="23" y="33" width="18" height="3" rx="1.5" fill="#c4b5fd"/>
      <rect x="27" y="40" width="10" height="4" rx="2" fill="#6d28d9"/>
      <rect x="13" y="44" width="38" height="18" rx="7" fill={`url(#${id}b)`}/>
      <rect x="19" y="49" width="26" height="9" rx="4" fill="rgba(0,0,0,.35)"/>
      <circle cx="26" cy="53.5" r="2.5" fill="#38bdf8"/>
      <circle cx="32" cy="53.5" r="2.5" fill="#a78bfa"/>
      <circle cx="38" cy="53.5" r="2.5" fill="#c4b5fd"/>
      <rect x="4" y="47" width="9" height="13" rx="4.5" fill="#5b21b6"/>
      <rect x="51" y="47" width="9" height="13" rx="4.5" fill="#5b21b6"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────── */
function Typing() {
  return (
    <div style={{display:'flex',gap:5,alignItems:'center',padding:'6px 4px',height:24}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{
          width:7,height:7,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#6366f1)',
          animation:`ncBounce 1.3s ease-in-out ${i*0.2}s infinite`,display:'block'
        }}/>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────── */
function Msg({ m, onImageClick }) {
  const bot = m.role === 'bot';
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    if (m.content) {
      navigator.clipboard.writeText(m.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{display:'flex',gap:9,alignItems:'flex-end',flexDirection:bot?'row':'row-reverse',marginBottom:4}}>
      {bot && (
        <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:8,boxShadow:'0 2px 10px rgba(124,58,237,.4)'}}>
          <RobotSVG size={19}/>
        </div>
      )}
      <div style={{
        maxWidth:'84%',padding:bot?'12px 15px':'10px 14px',borderRadius:bot?'20px 20px 20px 4px':'20px 20px 4px 20px',
        background:bot
          ?'linear-gradient(145deg,rgba(30,27,75,.85),rgba(15,23,42,.95))'
          :'linear-gradient(135deg,#6d28d9,#4f46e5)',
        border:bot?'1px solid rgba(139,92,246,.25)':'1px solid rgba(167,139,250,.3)',
        boxShadow:bot?'0 4px 20px rgba(0,0,0,.35)':'0 4px 20px rgba(109,40,217,.35)',
        backdropFilter:'blur(12px)',
        position:'relative',
      }}>
        {/* Render attached image thumbnail if message contains an image */}
        {m.image && (
          <div style={{marginBottom:8,borderRadius:12,overflow:'hidden',border:'1px solid rgba(255,255,255,.2)',background:'rgba(0,0,0,.3)'}}>
            <img
              src={m.image}
              alt="Attached Document"
              onClick={() => onImageClick && onImageClick(m.image)}
              style={{maxHeight:180,width:'100%',objectFit:'cover',display:'block',cursor:'pointer',transition:'opacity .2s'}}
              title="Click to view full image"
            />
            {m.imageName && (
              <div style={{padding:'4px 8px',fontSize:10,color:'rgba(255,255,255,.7)',background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',gap:4}}>
                <span>📷</span>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.imageName}</span>
              </div>
            )}
          </div>
        )}

        {m.typing ? <Typing/> : (
          <>
            <div style={{fontSize:13.5,lineHeight:1.65,color:bot?'#e2e8f0':'#fff'}}>
              {bot ? renderMD(m.content) : m.content}
            </div>
            <div style={{fontSize:10,color:bot?'rgba(148,163,184,.6)':'rgba(255,255,255,.6)',marginTop:6,display:'flex',alignItems:'center',justifyContent:bot?'space-between':'flex-end',gap:8}}>
              {bot && (
                <button
                  onClick={copyText}
                  style={{background:'none',border:'none',color:'rgba(165,180,252,.7)',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',gap:3,padding:'2px 4px',borderRadius:4}}
                  title="Copy text"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              )}
              <span>{new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PREMIUM LANGUAGE PICKER VIEW
───────────────────────────────────────────────────────────────── */
const LANG_GROUPS = [
  { name: 'Widely Spoken Languages', keys: ['en','hi','mr','bn','te','ta','gu','kn','ml','pa'] },
  { name: 'Regional Scheduled Languages', keys: ['or','as','ur','mai','kok','ne','doi'] },
  { name: 'Classical & Other Scheduled', keys: ['sa','mni','sd','ks','sat','bo'] },
];

function LangPicker({ currentLang, onSelect, onBack }) {
  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? Object.entries(LANGS).filter(([,l]) =>
        l.native.toLowerCase().includes(search.toLowerCase()) ||
        l.label.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'linear-gradient(165deg,#0b0b1c 0%,#130e2f 50%,#090918 100%)'}}>
      {/* Header */}
      <div style={{padding:'18px 18px 12px',textAlign:'center',flexShrink:0,borderBottom:'1px solid rgba(139,92,246,.15)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          {onBack ? (
            <button
              onClick={onBack}
              style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:10,padding:'5px 10px',color:'#c7d2fe',fontSize:11.5,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}
            >
              ← Back to Chat
            </button>
          ) : <div/>}
          <div style={{fontSize:11,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'.08em'}}>22 Scheduled Languages</div>
          <div style={{width:onBack?80:0}}/>
        </div>

        <div style={{width:58,height:58,borderRadius:'50%',background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(99,102,241,.15))',border:'1.5px solid rgba(139,92,246,.4)',margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 24px rgba(124,58,237,.25)'}}>
          <RobotSVG size={38} glow/>
        </div>
        <div style={{fontSize:18,fontWeight:800,color:'#fff',letterSpacing:'-0.02em',lineHeight:1.2}}>Choose Assistant Language</div>
        <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>Select your preferred Indian language for voice, answers & dashboard</div>

        {/* Search */}
        <div style={{marginTop:12,position:'relative'}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:13,opacity:.5}}>🔍</span>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search language (e.g. Hindi, Marathi, Bengali)..."
            style={{width:'100%',padding:'9px 12px 9px 34px',background:'rgba(99,102,241,.1)',border:'1px solid rgba(139,92,246,.3)',borderRadius:12,color:'#f8fafc',fontSize:12.5,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}
          />
        </div>
      </div>

      {/* Language list */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}} className="nc-scroll">
        {filtered ? (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {filtered.map(([code,lang]) => (
              <LangCard key={code} code={code} lang={lang} active={currentLang === code} onSelect={onSelect}/>
            ))}
          </div>
        ) : (
          LANG_GROUPS.map(grp => (
            <div key={grp.name} style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(167,139,250,.8)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7,paddingLeft:2}}>{grp.name}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {grp.keys.map(k => (
                  <LangCard key={k} code={k} lang={LANGS[k]} active={currentLang === k} onSelect={onSelect}/>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{textAlign:'center',padding:'8px 12px',fontSize:10,color:'rgba(148,163,184,.5)',borderTop:'1px solid rgba(139,92,246,.12)',background:'rgba(10,10,22,.9)'}}>
        🇮🇳 22 Official Scheduled Languages of India • Ministry of Consumer Affairs
      </div>
    </div>
  );
}

function LangCard({ code, lang, active, onSelect }) {
  const [hov, setHov] = useState(false);
  if (!lang) return null;
  return (
    <button
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onSelect(code)}
      style={{
        display:'flex',alignItems:'center',gap:9,padding:'9px 10px',
        borderRadius:12,
        background: active
          ? 'linear-gradient(135deg,rgba(124,58,237,.35),rgba(99,102,241,.25))'
          : hov ? 'rgba(124,58,237,.18)' : 'rgba(99,102,241,.06)',
        border:`1.5px solid ${active ? '#8b5cf6' : hov ? 'rgba(139,92,246,.5)' : 'rgba(99,102,241,.15)'}`,
        cursor:'pointer',textAlign:'left',transition:'all .15s',
        transform:hov?'translateY(-1px)':'translateY(0)',
        boxShadow: active ? '0 0 16px rgba(139,92,246,.25)' : 'none',
      }}
    >
      <span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{lang.flag}</span>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:12.5,fontWeight:700,color:active?'#c4b5fd':'#e2e8f0',lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
          {lang.native}
        </div>
        {lang.native !== lang.label && (
          <div style={{fontSize:10,color:'rgba(148,163,184,.6)',lineHeight:1.2}}>{lang.label}</div>
        )}
      </div>
      {active && <span style={{fontSize:12,color:'#a78bfa',fontWeight:800}}>✓</span>}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN NIRIKSAK CHATBOT COMPONENT
───────────────────────────────────────────────────────────────── */
export default function NiriksakChatbot() {
  const { language: storeLang, setLanguage: setStoreLang } = useAppStore();

  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(storeLang || 'en');
  const [viewPicker, setViewPicker] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [trigHov, setTrigHov] = useState(false);

  // Attached Image state
  const [attachedImage, setAttachedImage] = useState(null); // { file, dataUrl, base64, mimeType, name, size }
  const [modalImage, setModalImage] = useState(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const taRef = useRef(null);
  const fileInputRef = useRef(null);

  // Synchronize language bidirectionally with the dashboard store
  useEffect(() => {
    if (storeLang && storeLang !== lang) {
      setLang(storeLang);
      // If conversation is empty or has only greeting, update welcome message
      setMsgs(prev => {
        if (prev.length <= 1) {
          const pack = LANGS[storeLang] || LANGS.en;
          return [{ role:'bot', content:pack.welcome, ts:Date.now() }];
        }
        return prev;
      });
    }
  }, [storeLang]);

  // Initial welcome message
  useEffect(() => {
    if (msgs.length === 0) {
      const activeCode = lang || storeLang || 'en';
      const pack = LANGS[activeCode] || LANGS.en;
      setMsgs([{ role:'bot', content:pack.welcome, ts:Date.now() }]);
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs, busy]);

  // Focus textarea when opened
  useEffect(() => {
    if (open) {
      setHasNew(false);
      if (!viewPicker) setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, viewPicker]);

  // Auto-resize textarea
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Handle language selection (syncs both chatbot and dashboard)
  const handleSelectLang = useCallback((code) => {
    setLang(code);
    setStoreLang(code); // Update dashboard store!
    setViewPicker(false);
    const pack = LANGS[code] || LANGS.en;
    // Add language changed announcement
    setMsgs(prev => [
      ...prev,
      {
        role: 'bot',
        content: `🌐 **Language switched to ${pack.label} (${pack.native})**\n\n${pack.welcome}`,
        ts: Date.now()
      }
    ]);
  }, [setStoreLang]);

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please attach an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      setAttachedImage({
        file,
        dataUrl,
        base64,
        mimeType: file.type,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected if removed
  };

  // Handle paste from clipboard (e.g. screenshot paste)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            setAttachedImage({
              file,
              dataUrl,
              base64,
              mimeType: file.type,
              name: 'Pasted Screenshot ' + new Date().toLocaleTimeString(),
              size: (file.size / 1024).toFixed(1) + ' KB',
            });
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  // Send message
  const send = useCallback(async (customQuery) => {
    const text = (customQuery || input).trim();
    if ((!text && !attachedImage) || busy) return;

    const currentImage = attachedImage;
    setInput('');
    setAttachedImage(null); // Clear preview

    const pack = LANGS[lang] || LANGS.en;

    // Create user message object
    const userMsg = {
      role: 'user',
      content: text || 'Please inspect this image for Legal Metrology compliance: check instrument verification stamps, net quantity declarations, MRP, and rules compliance.',
      image: currentImage?.dataUrl,
      imageName: currentImage?.name,
      ts: Date.now()
    };

    setMsgs(prev => [...prev, userMsg, { role:'bot', content:'', typing:true, ts:Date.now() }]);
    setBusy(true);

    try {
      // Build Gemini parts
      const userParts = [];
      if (currentImage) {
        userParts.push({
          inline_data: {
            mime_type: currentImage.mimeType,
            data: currentImage.base64
          }
        });
      }
      userParts.push({
        text: text || "Please inspect this attached document/image under the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011. Check for valid verification stamping, mandatory markings, net quantity, MRP, serial numbers, and note any violations or compliance statuses."
      });

      // Assemble conversation history for Gemini (last 4 turns)
      const history = msgs
        .filter(m => !m.typing && !m.image)
        .slice(-4)
        .map(m => ({
          role: m.role === 'bot' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYS_PROMPT(pack.prompt) }] },
          contents: [...history, { role: 'user', parts: userParts }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: pack.budget || 2048,
          },
        })
      });

      const data = await res.json();
      const ans = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || (data?.error?.message ? `⚠️ Gemini API Notice: ${data.error.message}` : '⚠️ Unable to generate response. Please try again.');

      setMsgs(prev => [...prev.filter(m => !m.typing), { role:'bot', content:ans, ts:Date.now() }]);
      if (!open) setHasNew(true);
    } catch (err) {
      console.error('Chat error:', err);
      setMsgs(prev => [
        ...prev.filter(m => !m.typing),
        { role:'bot', content:'⚠️ Connection error: Failed to reach the Legal Metrology AI engine. Please verify your network connection and try again.', ts:Date.now() }
      ]);
    } finally {
      setBusy(false);
    }
  }, [input, attachedImage, busy, lang, msgs, open]);

  const clearChat = () => {
    const pack = LANGS[lang] || LANGS.en;
    setMsgs([{ role:'bot', content:pack.welcome, ts:Date.now() }]);
  };

  const pack = LANGS[lang] || LANGS.en;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Image Modal / Lightbox ── */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position:'fixed',inset:0,zIndex:100000,background:'rgba(0,0,0,.85)',backdropFilter:'blur(8px)',
            display:'flex',alignItems:'center',justifyContent:'center',padding:20,cursor:'zoom-out'
          }}
        >
          <div style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}}>
            <img src={modalImage} alt="Expanded Preview" style={{maxWidth:'100%',maxHeight:'90vh',borderRadius:12,boxShadow:'0 16px 48px rgba(0,0,0,.8)',border:'1px solid rgba(255,255,255,.2)'}}/>
            <button
              onClick={() => setModalImage(null)}
              style={{position:'absolute',top:-14,right:-14,width:32,height:32,borderRadius:'50%',background:'#f43f5e',border:'none',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(0,0,0,.5)'}}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Action Trigger Button ── */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        {!open && (
          <div style={{
            background:'linear-gradient(135deg,#1e1b4b,#31104b)',border:'1px solid rgba(139,92,246,.4)',
            padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700,color:'#c4b5fd',
            boxShadow:'0 4px 16px rgba(0,0,0,.4)',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:5,
            animation:'ncFloat 3s ease-in-out infinite'
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
            <span>Niriksak AI</span>
            <span style={{opacity:.6}}>•</span>
            <span style={{color:'#f8fafc'}}>{pack.flag}</span>
          </div>
        )}
        <button
          id="nc-fab"
          onMouseEnter={()=>setTrigHov(true)} onMouseLeave={()=>setTrigHov(false)}
          onClick={()=>setOpen(o=>!o)}
          title="Open Niriksak Legal Metrology AI Chatbot"
          style={{
            width: open?56:66, height: open?56:66,
            borderRadius:'50%',
            background: open
              ?'linear-gradient(135deg,#371b69,#2e1065)'
              :'linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#4f46e5 100%)',
            border: open ? '1.5px solid rgba(167,139,250,.3)' : '2px solid rgba(255,255,255,.25)',
            cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow: trigHov
              ?'0 14px 44px rgba(124,58,237,.7), 0 0 0 8px rgba(124,58,237,.15)'
              :'0 8px 32px rgba(124,58,237,.5), inset 0 1px 0 rgba(255,255,255,.3)',
            transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
            transform: trigHov&&!open?'scale(1.08) translateY(-3px)':'scale(1)',
            outline:'none',position:'relative',
          }}
        >
          {open
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            : <RobotSVG size={36} glow/>
          }
          {hasNew && <span className="nc-notif"/>}
        </button>
      </div>

      {/* ── Chat Window ── */}
      <div className={`nc-win ${open?'nc-win-open':''}`}>

        {/* Shimmer Ambient Glow */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:180,background:'radial-gradient(circle at 50% 0%, rgba(124,58,237,.18), transparent 70%)',pointerEvents:'none',borderRadius:'24px 24px 0 0'}}/>

        {/* ── Header ── */}
        <div style={{
          background:'linear-gradient(135deg,#2e1065 0%,#3b0764 40%,#1e1b4b 100%)',
          padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
          flexShrink:0,position:'relative',borderBottom:'1px solid rgba(139,92,246,.25)',
        }}>
          {/* Subtle Top Accent Strip */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#FF9933,#ffffff,#138808)'}}/>

          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{
              width:44,height:44,borderRadius:'50%',
              background:'linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.05))',
              border:'1.5px solid rgba(255,255,255,.25)',
              display:'flex',alignItems:'center',justifyContent:'center',
              position:'relative',boxShadow:'0 4px 16px rgba(0,0,0,.3)',
              backdropFilter:'blur(8px)',
            }}>
              <RobotSVG size={30} glow/>
              <span style={{position:'absolute',bottom:1,right:1,width:10,height:10,borderRadius:'50%',background:'#22c55e',border:'2px solid #2e1065'}}/>
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontWeight:800,color:'#fff',fontSize:15,letterSpacing:'-0.01em',lineHeight:1.2}}>Niriksak AI</span>
                <span style={{fontSize:9.5,background:'rgba(139,92,246,.3)',color:'#e0e7ff',padding:'1px 6px',borderRadius:8,fontWeight:600,border:'1px solid rgba(167,139,250,.3)'}}>RAG Vision</span>
              </div>
              <div style={{fontSize:11,color:'rgba(216,180,254,.9)',marginTop:2,display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                <span>{pack.online}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {/* Language Switcher Pill */}
            <button
              onClick={() => setViewPicker(v => !v)}
              title="Change Indian Language"
              style={{
                background: viewPicker ? 'rgba(139,92,246,.4)' : 'rgba(255,255,255,.1)',
                border:'1px solid rgba(255,255,255,.2)',borderRadius:14,
                padding:'4px 9px',cursor:'pointer',fontSize:11.5,color:'#fff',
                display:'flex',alignItems:'center',gap:4,transition:'all .2s'
              }}
            >
              <span>{pack.flag}</span>
              <span style={{fontWeight:600}}>{pack.native}</span>
              <span style={{fontSize:9,opacity:.7}}>▾</span>
            </button>

            {/* Clear conversation */}
            <button
              onClick={clearChat}
              title="Clear conversation"
              style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'50%',width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#c4b5fd',transition:'background .2s'}}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              title="Close window"
              style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'50%',width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',transition:'background .2s'}}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {viewPicker ? (
          <LangPicker
            currentLang={lang}
            onSelect={handleSelectLang}
            onBack={() => setViewPicker(false)}
          />
        ) : (
          <>
            {/* Messages Scroll Area */}
            <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:10,scrollBehavior:'smooth'}} className="nc-scroll">
              {msgs.map((m, i) => (
                <Msg
                  key={i}
                  m={m}
                  onImageClick={(url) => setModalImage(url)}
                />
              ))}

              {/* Starter Suggested Chips (shown if only 1 message exists) */}
              {msgs.length === 1 && pack && (
                <div style={{marginTop:6,marginBottom:4}}>
                  <div style={{fontSize:11,color:'rgba(167,139,250,.9)',fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:4}}>
                    <span>💡</span>
                    <span>{pack.ask}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {pack.chips.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => send(c)}
                        style={{
                          padding:'8px 12px',textAlign:'left',
                          background:'rgba(99,102,241,.08)',border:'1px solid rgba(139,92,246,.25)',
                          borderRadius:12,fontSize:12,color:'#c7d2fe',cursor:'pointer',
                          transition:'all .2s',lineHeight:1.4,display:'flex',alignItems:'center',justifyContent:'space-between'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(124,58,237,.22)';
                          e.currentTarget.style.borderColor = '#8b5cf6';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(99,102,241,.08)';
                          e.currentTarget.style.borderColor = 'rgba(139,92,246,.25)';
                          e.currentTarget.style.color = '#c7d2fe';
                        }}
                      >
                        <span>{c}</span>
                        <span style={{fontSize:14,opacity:.6}}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* ── Attached Image Preview Banner (if image is selected) ── */}
            {attachedImage && (
              <div style={{
                padding:'8px 12px',background:'rgba(30,27,75,.85)',
                borderTop:'1px solid rgba(139,92,246,.3)',borderBottom:'1px solid rgba(139,92,246,.2)',
                display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
                  <img
                    src={attachedImage.dataUrl}
                    alt="Thumbnail"
                    style={{width:38,height:38,borderRadius:8,objectFit:'cover',border:'1.5px solid #8b5cf6'}}
                  />
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:'#f8fafc',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {attachedImage.name}
                    </div>
                    <div style={{fontSize:10,color:'#38bdf8',display:'flex',alignItems:'center',gap:6,marginTop:1}}>
                      <span>{attachedImage.size}</span>
                      <span>•</span>
                      <span style={{color:'#a78bfa'}}>Vision Analysis Ready</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  style={{
                    background:'rgba(244,63,94,.2)',border:'1px solid rgba(244,63,94,.4)',
                    color:'#fda4af',borderRadius:'50%',width:24,height:24,
                    cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700
                  }}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ── Input Bar ── */}
            <div style={{
              padding:'10px 12px',display:'flex',gap:8,alignItems:'flex-end',
              borderTop:'1px solid rgba(139,92,246,.18)',background:'rgba(9,9,20,.98)',flexShrink:0
            }}>
              {/* Hidden File Input for Image Attachment */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{display:'none'}}
              />

              {/* Attach Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                title="Attach photo of instrument, stamp, or label"
                style={{
                  width:38,height:38,borderRadius:12,
                  background: attachedImage ? 'rgba(124,58,237,.35)' : 'rgba(99,102,241,.1)',
                  border: `1.5px solid ${attachedImage ? '#8b5cf6' : 'rgba(139,92,246,.25)'}`,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  color: attachedImage ? '#c4b5fd' : '#94a3b8',
                  transition:'all .2s',
                }}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = 'rgba(124,58,237,.25)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!busy && !attachedImage) { e.currentTarget.style.background = 'rgba(99,102,241,.1)'; e.currentTarget.style.color = '#94a3b8'; } }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Textarea */}
              <textarea
                ref={el => { inputRef.current = el; taRef.current = el; }}
                id="nc-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={attachedImage ? 'Add a question about this image, or press Send to analyze...' : pack.ph}
                rows={1}
                disabled={busy}
                style={{
                  flex:1,background:'rgba(99,102,241,.08)',border:'1px solid rgba(139,92,246,.22)',
                  borderRadius:14,padding:'9px 12px',color:'#f8fafc',fontSize:13,
                  fontFamily:'inherit',resize:'none',outline:'none',lineHeight:1.5,
                  maxHeight:120,overflowY:'auto',transition:'border .2s'
                }}
                className="nc-ta"
              />

              {/* Send Button */}
              <button
                id="nc-send"
                onClick={() => send()}
                disabled={busy || (!input.trim() && !attachedImage)}
                title="Send query"
                style={{
                  width:38,height:38,borderRadius:'50%',
                  background: busy || (!input.trim() && !attachedImage)
                    ? 'rgba(99,102,241,.2)'
                    : 'linear-gradient(135deg,#7c3aed,#6366f1)',
                  border:'none',
                  cursor: busy || (!input.trim() && !attachedImage) ? 'not-allowed' : 'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  boxShadow: busy || (!input.trim() && !attachedImage) ? 'none' : '0 4px 14px rgba(124,58,237,.5)',
                  transition:'all .2s',
                  color:'#fff'
                }}
              >
                {busy ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{animation:'ncSpin 1s linear infinite'}}>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Footer Attribution */}
            <div style={{textAlign:'center',fontSize:10,color:'rgba(148,163,184,.45)',padding:'4px 12px 8px',flexShrink:0}}>
              {pack.powered}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes ncBounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }
  @keyframes ncSpin   { to{transform:rotate(360deg)} }
  @keyframes ncSlideIn { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes ncPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
  @keyframes ncFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

  .nc-notif {
    position:absolute; top:4px; right:4px;
    width:12px; height:12px; border-radius:50%;
    background:#f43f5e; border:2px solid #2e1065;
    animation:ncPulse 1.5s infinite;
  }

  .nc-win {
    position:fixed; bottom:104px; right:24px; z-index:9998;
    width:420px; height:620px; max-height:calc(100vh - 130px);
    border-radius:24px;
    background:linear-gradient(180deg,#0f0e22 0%,#080816 100%);
    border:1px solid rgba(139,92,246,.25);
    box-shadow:0 24px 64px -12px rgba(0,0,0,.7), 0 0 0 1px rgba(139,92,246,.12), 0 0 32px -8px rgba(124,58,237,.25);
    display:flex; flex-direction:column; overflow:hidden;
    opacity:0; transform:translateY(18px) scale(.96); pointer-events:none;
    font-family:'Inter','Segoe UI',system-ui,sans-serif;
    backdrop-filter:blur(24px);
  }
  .nc-win-open {
    opacity:1; transform:translateY(0) scale(1); pointer-events:all;
    animation:ncSlideIn .28s cubic-bezier(.34,1.56,.64,1) forwards;
  }

  .nc-scroll::-webkit-scrollbar { width:4px; }
  .nc-scroll::-webkit-scrollbar-track { background:transparent; }
  .nc-scroll::-webkit-scrollbar-thumb { background:rgba(139,92,246,.3); border-radius:2px; }
  .nc-scroll::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,.5); }

  .nc-ta::placeholder { color:rgba(148,163,184,.4); }
  .nc-ta:focus { border-color:rgba(139,92,246,.6)!important; box-shadow:0 0 0 3px rgba(124,58,237,.15); }

  @media (max-width:460px) {
    .nc-win { width:calc(100vw - 24px); right:12px; bottom:96px; height:calc(100vh - 120px); }
  }
`;
