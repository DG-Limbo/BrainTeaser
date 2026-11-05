/* ================= REAL OR AI LIBRARY =================
   Human texts: copied from US government science pages published 2018–2020 (public domain),
   plus two public-domain classics. AI texts: written by an AI for this game.
   diff: 1 light · 2 medium · 3 heavy */
const SRC = {
  nih1:{name:"NIH Research Matters, 2019 highlights", url:"https://www.nih.gov/news-events/nih-research-matters/2019-research-highlights-human-health-advances"},
  nih2:{name:"NIH Research Matters, 2019 highlights", url:"https://www.nih.gov/news-events/nih-research-matters/2019-research-highlights-basic-research-insights"},
  noaa:{name:"NOAA media release, November 2020", url:"https://www.noaa.gov/media-release/record-breaking-atlantic-hurricane-season-draws-to-end"},
  nisti:{name:"NIST, Top NIST Images of 2018 (Feb 2019)", url:"https://www.nist.gov/node/1539456"},
  nistk:{name:"NIST, Kilogram: Introduction (2018)", url:"https://www.nist.gov/node/1338196"},
  jpl:{name:"NASA JPL news, April 2019", url:"https://www.jpl.nasa.gov/news/nasas-insight-detects-first-likely-quake-on-mars/"},
  usgs:{name:"USGS, Kīlauea 2018 eruption overview", url:"https://www.usgs.gov/volcanoes/kilauea/science/science-topics/2018-lower-east-rift-zone-eruption-and-summit-collapse"},
  nih3:{name:"NIH Research Matters, 2018 highlights", url:"https://www.nih.gov/news-events/nih-research-matters/2018-research-highlights-insights-lab"},
  nih4:{name:"NIH Research Matters, 2018 highlights (intro)", url:"https://www.nih.gov/news-events/nih-research-matters/2018-research-highlights-promising-medical-advances"},
  bls1:{name:"BLS, The Economics Daily, October 2019", url:"https://www.bls.gov/opub/ted/2019/payroll-employment-increased-by-136000-in-september-2019.htm"},
  bls2:{name:"BLS, The Economics Daily headlines, 2019–2020", url:"https://webarchive.library.unt.edu/web/20200826175224/https://www.bls.gov/opub/ted/year.htm"},
  eia:{name:"EIA, Today in Energy headlines, August 2019", url:"https://webarchive.library.unt.edu/web/20201218031713/https:/www.eia.gov/todayinenergy/archive.cfm?my=Aug2019"},
  census:{name:"US Census Bureau, America Counts (2020)", url:"https://webarchive.library.unt.edu/web/20210119193626/https://www.census.gov/AmericaCounts"},
  cdc:{name:"CDC, MMWR report titles, 2019", url:"https://webarchive.library.unt.edu/web/20210120073716/https://www.cdc.gov/mmwr/index2019.html"},
  darwin:{name:"Charles Darwin, On the Origin of Species (1859)", url:null},
  austen:{name:"Jane Austen, Pride and Prejudice (1813)", url:null}
};

// Human excerpts, keyed so pairs and paragraphs can reuse them
const H = {
  scid:{s:"nih1", fmt:"Research summary", text:"Eight infants with X-SCID had their immune systems repaired by a new gene therapy approach.", why:"It leads with a concrete result: an exact number of patients and a named condition. No praise, no wrap-up."},
  vessels:{s:"nih1", fmt:"Research summary", text:"Researchers created bioengineered blood vessels called human acellular vessels to aid in dialysis.", why:"Dry and technical. It names the exact thing that was made instead of calling it groundbreaking."},
  veg:{s:"nih1", fmt:"Research summary", text:"Public health campaigns have urged people to eat more vegetables by emphasizing their health benefits.", why:"A flat setup sentence for the study that follows. It doesn't try to sound important."},
  synuclein:{s:"nih2", fmt:"Research summary", text:"Researchers were able to track alpha-synuclein from the gut to the brain by way of the vagus nerve in mice.", why:"Very specific (a named protein, a named nerve) and it admits the study was in mice. AI tends to drop limiting details like that."},
  afm:{s:"nih2", fmt:"Research summary", text:"In a new study, evidence of infection with an enterovirus was found in about 80% of people with AFM.", why:"An approximate but real figure (about 80%) and an acronym it doesn't bother to spell out."},
  biofilm:{s:"nih2", fmt:"Research summary", text:"A biofilm is a layer of microbes that can grow on many kinds of surfaces, including inside the body.", why:"A plain textbook definition to set up the story. No adjectives, no big claims."},
  brownfat:{s:"nih2", fmt:"Research summary", text:"Brown fat breaks down blood sugar and fat molecules to create heat and help maintain body temperature.", why:"It explains the mechanism directly, with no nickname and no \"plays a key role\"."},
  sleep:{s:"nih2", fmt:"Research summary", text:"Studies have linked poor sleep to an increased risk of heart disease and other health conditions.", why:"Careful scientific wording (\"have linked\", \"risk\") and nothing dramatic."},
  seasonend:{s:"noaa", fmt:"Agency press release", text:"This season may officially end on Nov. 30, but it is still possible for additional storms to develop.", why:"A practical warning with a real date. Written to be useful, not inspiring."},
  average:{s:"noaa", fmt:"Agency press release", text:"An average season has 12 named storms, six hurricanes, and three major hurricanes.", why:"Exact figures. AI tends to say \"around a dozen\" or \"varies considerably\" instead."},
  nine:{s:"nisti", fmt:"Lab feature", text:"Those 9 seconds may not seem like much, but they could hold the key to discovering the origin and identity of dark matter.", why:"Tricky one. \"Hold the key\" sounds like AI, but the sentence hangs on an odd, specific detail from a real experiment: 9 seconds.", trick:true},
  neutrons:{s:"nisti", fmt:"Lab feature", text:"Scientists shoot a beam of neutrons into the proton trap. As the neutrons decay, the protons are caught and counted.", why:"Short physical verbs (shoot, caught, counted) describing what actually happens in the lab."},
  vault:{s:"nisti", fmt:"Lab feature", text:"Starting in May 2019, the kilogram will no longer be based on an artifact kept in a vault in France.", why:"A concrete image (an object in a vault) and a specific date."},
  y1960:{s:"nistk", fmt:"Explainer", text:"After 1960, the kilogram was the only SI unit still defined in terms of a single manufactured object.", why:"Packed with facts: a year, a technical term (SI unit), a precise claim."},
  profound:{s:"nistk", fmt:"Explainer", text:"That transformation was as profound as any in the history of measurement.", why:"Tricky one. \"Profound\" sounds like AI, but NIST wrote this in 2018. One big word doesn't prove AI; look for the other habits too.", trick:true},
  quakes:{s:"jpl", fmt:"Science news", text:"Most people are familiar with quakes on Earth, which occur on faults created by the motion of tectonic plates.", why:"A plain setup for comparing Earth with Mars. Slightly textbook, nothing flashy."},
  sol128:{s:"jpl", fmt:"Science news", text:"Regardless of its cause, the Sol 128 signal is an exciting milestone for the team.", why:"Tricky one. \"Exciting milestone\" is PR-speak, but \"Sol 128\" (a count of Mars days) is an insider detail AI rarely invents.", trick:true},
  examining:{s:"jpl", fmt:"Science news", text:"Scientists still are examining the data to determine the exact cause of the signal.", why:"Slightly awkward word order (\"still are examining\"). Human writing has small quirks; AI text is usually smoother."},
  kilauea:{s:"usgs", fmt:"Agency explainer", text:"A large lower East Rift Zone eruption partially drained the summit magma reservoir, which caused portions of the unsupported summit caldera floor to collapse.", why:"Long, technical and full of place names. Written to inform specialists, not to impress."},
  senescent:{s:"nih3", d:1, fmt:"Research summary", text:"Scientists found that eliminating senescent cells reduced signs of brain disease in mice.", why:"A plain report of one result, and it admits the study was in mice."},
  skeletal:{s:"nih3", fmt:"Research summary", text:"By labeling and carefully tracking cells, scientists identified a self-renewing human skeletal stem cell.", why:"It describes the actual method (labeling and tracking cells) and a precise finding, with no hype."},
  insulin:{s:"nih3", fmt:"Research summary", text:"Researchers developed a way to package insulin into capsules that protect it from the stomach.", why:"Concrete and physical: capsules, the stomach. It doesn't promise to transform anyone's life."},
  contraceptive:{s:"nih3", fmt:"Research summary", text:"With further testing and improvement, the compound could potentially be developed into a reversible male contraceptive.", why:"Tricky one. \"Could potentially be developed\" sounds like AI hedging, but NIH wrote this in 2018. Scientists hedge too; here the hedge is tied to one specific compound and one use.", trick:true},
  opioids:{s:"nih3", fmt:"Research summary", text:"Opioids work by activating specific receptors on nerve cells.", why:"A one-line textbook fact that sets up the study. No adjectives at all."},
  groundbreaking:{s:"nih4", fmt:"Research summary", text:"Groundbreaking NIH-funded research often receives top scientific honors.", why:"Tricky one. \"Groundbreaking\" is the classic AI word, but NIH wrote this in 2018. One buzzword alone isn't proof.", trick:true},
  payroll:{s:"bls1", d:1, fmt:"Economic news", text:"Total nonfarm payroll employment increased by 136,000 in September 2019.", why:"An exact number, a month and a technical term (nonfarm payroll). Statistics agencies write exactly like this."},
  healthjobs:{s:"bls1", d:1, fmt:"Economic news", text:"Employment continued to trend up in health care (+39,000) and in professional and business services (+34,000).", why:"Exact figures in brackets and dry jargon (\"continued to trend up\"). Nobody is trying to sound inspiring."},
  earnings:{s:"bls1", fmt:"Economic news", text:"Average weekly earnings in education and health services were $908.04 in September.", why:"Down to the cent. AI rarely invents numbers this precise."},
  mfg:{s:"census", fmt:"Data story", text:"Nearly one-fourth of the manufacturing workforce is age 55 or older and retaining and attracting workers is a challenge.", why:"Slightly clunky: a run-on with a missing comma. Real writers leave small rough edges; AI text is usually polished."},
  estimates:{s:"census", fmt:"Data story", text:"Independent estimates will help assess the accuracy of the 2020 Census.", why:"A plain, functional sentence explaining why a report exists. No drama."},
  wealth:{s:"census", d:1, fmt:"Data story", text:"Home equity and retirement accounts make up 61.7% of household wealth.", why:"A precise figure (61.7%) and nothing else. AI tends to add a lesson about what it means."},
  datatool:{s:"census", fmt:"Data story", text:"Interactive data tool allows you to compare marriage and divorce rates across states for 2009 and 2019.", why:"It drops the \"An\" at the start, headline-style. A small human quirk, plus exact years."},
  gas:{s:"eia", fmt:"Headline", text:"U.S. retail gasoline prices heading into Labor Day are lower than last year", why:"A literal headline tied to a specific moment (Labor Day). Analyst headlines state the finding; they don't tease."},
  refinery:{s:"eia", d:1, fmt:"Headline", text:"Annual U.S. refinery runs expected to decline for first time in 10 years", why:"A specific, checkable claim (first decline in 10 years) and industry jargon (refinery runs)."},
  lng:{s:"eia", d:1, fmt:"Headline", text:"Australia is on track to become world’s largest LNG exporter", why:"Plain and specific: one country, one ranking, one jargon term (LNG)."},
  gdp:{s:"eia", fmt:"Headline", text:"Energy expenditures per dollar of GDP are highest in energy-producing states", why:"Technical and literal (\"per dollar of GDP\"). It reads like a chart title, not a hook."},
  strait:{s:"eia", fmt:"Headline", text:"The Bab el-Mandeb Strait is a strategic route for oil and natural gas shipments", why:"A precise place name most people have never heard of. AI headlines stay general."},
  wages:{s:"bls2", d:1, fmt:"Headline", text:"Real average weekly earnings up 4.7 percent from November 2019 to November 2020", why:"Exact percentage and exact months. Statistical headlines are dry on purpose."},
  jobs:{s:"bls2", d:1, fmt:"Headline", text:"Payroll employment up by 245,000 in November; down 9.8 million since February 2020", why:"Two precise numbers and a semicolon. Nobody writes clickbait like this."},
  cpi:{s:"bls2", fmt:"Headline", text:"Consumer Price Index: 2019 in review", why:"Bare and functional. It's a label, not a hook."},
  peas:{s:"cdc", d:1, fmt:"Headline", text:"Notes from the Field: Botulism Outbreak Associated with Home-Canned Peas — New York City, 2018", why:"Very specific: the food, the city, the year, in the journal's fixed title format."},
  tb:{s:"cdc", fmt:"Headline", text:"Tuberculosis — United States, 2018", why:"Formulaic: the way a public-health journal titles its yearly report."},
  grandeur:{s:"darwin", fmt:"Classic text", text:"There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one.", why:"Clunky, careful phrasing (\"a few forms or into one\"): a scientist hedging his claim, not a writer polishing a quote."},
  pride:{s:"austen", fmt:"Classic text", text:"I could easily forgive his pride, if he had not mortified mine.", why:"The joke turns on one word (\"mine\"). Tight wit like this is hard for AI to copy without over-explaining.", trick:true}
};

// Format 1: single excerpts
const SINGLES = [
  // human (plain = medium, tricky = heavy)
  ...Object.keys(H).map(k => ({who:"human", h:k, diff: H[k].trick ? 3 : H[k].d || (["scid","average","vault","y1960","kilauea","afm","synuclein"].includes(k) ? 1 : 2)})),
  // AI, obvious = light
  {who:"ai", diff:1, fmt:"Research summary", text:"This groundbreaking study underscores the pivotal role gut microbes play in shaping not only digestion, but also mood, memory, and overall well-being.", why:"Stacked AI favourites: \"groundbreaking\", \"underscores\", \"pivotal\", \"not only… but also\", and a neat list of three."},
  {who:"ai", diff:1, fmt:"Agency press release", text:"The 2020 season served as a stark reminder of the ever-evolving challenges posed by our changing climate and the importance of preparedness.", why:"\"Stark reminder\" and \"ever-evolving\" are stock phrases. NOAA's real release gives exact storm counts instead."},
  {who:"ai", diff:1, fmt:"Science news", text:"Each new seismic signal offers a fascinating glimpse into the hidden inner workings of the Red Planet, opening exciting new frontiers for exploration.", why:"All atmosphere, no facts: \"fascinating glimpse\", \"hidden inner workings\", \"new frontiers\"."},
  {who:"ai", diff:1, fmt:"Lab feature", text:"By anchoring the kilogram to a fundamental constant of nature, scientists have ushered in a new era of precision that will benefit generations to come.", why:"\"Ushered in a new era\" and \"generations to come\" are grand endings with nothing specific attached."},
  {who:"ai", diff:1, fmt:"Agency explainer", text:"The eruption reshaped the landscape in profound ways, serving as a powerful testament to the dynamic and ever-changing nature of our planet.", why:"\"A testament to\" is one of the most common AI phrases. No place names, no dates."},
  {who:"ai", diff:1, fmt:"Research paper", text:"Moreover, the findings shed light on the complex interplay between genetics, environment, and lifestyle in shaping long-term outcomes.", why:"\"Moreover\", \"shed light on\", \"complex interplay\", and three broad factors. Sounds academic, says almost nothing."},
  {who:"ai", diff:1, fmt:"Research summary", text:"Ultimately, the discovery highlights the remarkable resilience of the immune system and paves the way for more targeted therapies.", why:"\"Ultimately\", \"remarkable\", \"paves the way\". A conclusion with no result in it."},
  {who:"ai", diff:1, fmt:"Research summary", text:"The team's innovative approach leverages cutting-edge imaging techniques to provide unprecedented insights into how neurons communicate.", why:"\"Innovative\", \"leverages\", \"cutting-edge\", \"unprecedented\". Four hype words, no actual technique named."},
  {who:"ai", diff:1, fmt:"Paper abstract", text:"This paper explores the multifaceted relationship between social media use and academic performance, offering a nuanced framework for future research.", why:"\"Explores\", \"multifaceted\", \"nuanced framework\". An abstract with no method, sample or finding."},
  {who:"ai", diff:2, fmt:"News article", text:"As remote work continues to reshape the modern workplace, companies are navigating a complex landscape of opportunities and challenges.", why:"\"Navigating a complex landscape\" and \"opportunities and challenges\" fit any topic."},
  {who:"ai", diff:2, fmt:"Research paper", text:"It is important to note that while these findings are encouraging, further research is needed to fully understand the long-term implications.", why:"\"It is important to note\" plus a generic caveat. AI adds these to sound balanced."},
  {who:"ai", diff:2, fmt:"News article", text:"Experts say the shift could have far-reaching consequences for consumers, businesses, and policymakers alike.", why:"Unnamed \"experts\", \"far-reaching consequences\", and a list of three groups. Real reporting names who said it."},
  {who:"ai", diff:2, fmt:"Paper abstract", text:"Taken together, these results suggest that small, consistent changes in daily habits can lead to meaningful improvements over time.", why:"A conclusion that would fit any study about anything. \"Meaningful improvements\" without saying what improved."},
  // AI, mid
  {who:"ai", diff:2, fmt:"Research summary", text:"Researchers found that students who studied in shorter sessions retained more material, highlighting a promising avenue for rethinking traditional study habits.", why:"No numbers, no university, no sample size. It ends on \"a promising avenue\", a vague future-facing wrap-up."},
  {who:"ai", diff:2, fmt:"Explainer", text:"From its humble beginnings in a vault near Paris to its modern redefinition, the kilogram's journey reflects humanity's enduring quest for accuracy.", why:"The \"From X to Y\" opener and \"humanity's enduring quest\" are AI storytelling templates."},
  {who:"ai", diff:2, fmt:"News article", text:"The city's library system saw a surge in visitors last year, underscoring the enduring value of public spaces in the digital age.", why:"\"Underscoring\", \"enduring value\", \"in the digital age\". The fact is vague (\"a surge\") and the lesson is tacked on."},
  {who:"ai", diff:2, fmt:"Classic text", text:"When we look upon the humble beetle in the hedgerow, we behold not a lesser creature, but a quiet testament to the patient artistry of ages.", why:"An imitation of Darwin. \"A testament to\" and \"not X, but Y\" give it away."},
  // AI headlines and economic/data writing
  {who:"ai", diff:1, fmt:"Headline", text:"Navigating the Shifting Landscape of Global Energy Markets", why:"\"Navigating\" and \"shifting landscape\" fit any topic. Real energy headlines name a country, a fuel or a number."},
  {who:"ai", diff:1, fmt:"Headline", text:"The Hidden Forces Driving Today's Job Market", why:"A vague tease (\"hidden forces\") with no number or month. Compare BLS: \"Payroll employment up by 245,000 in November\"."},
  {who:"ai", diff:1, fmt:"Headline", text:"Unlocking the Potential of Renewable Energy: Challenges and Opportunities Ahead", why:"\"Unlocking the potential\" plus \"challenges and opportunities\": two stock AI phrases in one title."},
  {who:"ai", diff:2, fmt:"Headline", text:"Why Wage Growth Matters More Than Ever for Working Families", why:"\"More than ever\" and a broad audience (\"working families\") instead of an actual figure."},
  {who:"ai", diff:2, fmt:"Headline", text:"A Closer Look at Inflation: What the Latest Numbers Really Mean", why:"Promises numbers but gives none. \"A closer look\" and \"what it really means\" are filler hooks."},
  {who:"ai", diff:2, fmt:"Headline", text:"Liquefied Natural Gas Exports Surge to New Heights as Global Demand Soars", why:"Stacked hype verbs (\"surge\", \"new heights\", \"soars\") and no country or figure."},
  {who:"ai", diff:2, fmt:"Economic news", text:"The labor market showed continued resilience, with steady gains across a wide range of key sectors.", why:"\"Continued resilience\" and \"a wide range of key sectors\" with no numbers. BLS would give the exact count."},
  {who:"ai", diff:3, fmt:"Headline", text:"Home-canned vegetables linked to rare botulism cases, health officials warn", why:"Subtle. \"Health officials warn\" is a generic attribution: no agency, place or year, unlike the real CDC title."},
  {who:"ai", diff:3, fmt:"Data story", text:"Nearly a quarter of factory workers are now 55 or older, and many employers say finding younger replacements is getting harder.", why:"Subtle. Reads like news, but \"many employers say\" is unsourced and \"getting harder\" is vague. The real Census line is clunkier and more exact."},
  // AI, subtle = heavy
  {who:"ai", diff:3, fmt:"Research summary", text:"Brown fat, often dubbed the body's internal furnace, plays a key role in regulating temperature and energy balance.", why:"Subtle. \"Often dubbed\" (by whom?) and \"plays a key role\", which says something matters without saying how."},
  {who:"ai", diff:3, fmt:"Agency press release", text:"An average hurricane season produces around a dozen named storms, though the exact number can vary considerably from year to year.", why:"Subtle. It hedges where a real agency gives numbers: NOAA says exactly 12 storms, six hurricanes, three major."},
  {who:"ai", diff:3, fmt:"Science news", text:"Engineers redesigned the probe's heat shield after early tests showed it cracked at lower temperatures than expected, a setback that ultimately strengthened the mission.", why:"Subtle. The facts sound plausible, but it ends with a tidy happy lesson (\"a setback that ultimately strengthened\")."},
  {who:"ai", diff:3, fmt:"News article", text:"The new bridge will cut commute times for thousands of residents, bringing the two neighborhoods closer together in more ways than one.", why:"Subtle. \"Thousands of residents\" is vague, and \"in more ways than one\" is a cliché closer."},
  {who:"ai", diff:3, fmt:"Science news", text:"Volunteers counted birds at more than 300 sites, and their efforts provide a valuable snapshot of how local populations are faring.", why:"Subtle. A specific-sounding number, then a generic close: \"a valuable snapshot of how … are faring\"."},
  {who:"ai", diff:3, fmt:"Science news", text:"The telescope's mirror is made of 18 hexagonal segments that unfold in space, a feat of engineering that continues to inspire.", why:"Subtle. The fact is real, but \"a feat of engineering that continues to inspire\" is AI-style padding added to the end."}
];

// Format 2: Which one? Same topic, one human, one AI
const PAIRS = [
  {h:"scid", diff:1, ai:"In a remarkable breakthrough, a cutting-edge gene therapy has offered new hope to infants born with a devastating immune disorder.", why:"The AI one never says how many infants or which disorder. It swaps facts for \"remarkable\", \"cutting-edge\" and \"new hope\"."},
  {h:"vessels", diff:1, ai:"Scientists have engineered innovative lab-grown blood vessels that could revolutionize the way patients receive life-saving dialysis.", why:"\"Innovative\", \"revolutionize\", \"life-saving\". The human one just names what was built."},
  {h:"veg", diff:2, ai:"For decades, health campaigns have encouraged people to eat more vegetables, yet many still struggle to make these nutritious foods a regular part of their diet.", why:"Close call. The AI one adds a little drama (\"For decades\", \"yet many still struggle\") that the plain human setup doesn't need."},
  {h:"synuclein", diff:1, ai:"Researchers traced a key protein's fascinating journey from the gut to the brain, shedding new light on the mysterious origins of Parkinson's disease.", why:"\"Fascinating journey\", \"shedding new light\", \"mysterious origins\". The human one names the protein, the nerve and the mice."},
  {h:"afm", diff:2, ai:"A new study has uncovered a strong link between a common virus and a rare paralyzing condition, raising important questions for parents and doctors alike.", why:"No numbers, and a stock ending (\"raising important questions for … alike\"). The human one gives about 80%."},
  {h:"biofilm", diff:2, ai:"Biofilms are complex, resilient communities of microbes that play a key role in many persistent infections.", why:"\"Complex, resilient\" and \"play a key role\" are AI habits. The human definition is plainer and more concrete."},
  {h:"brownfat", diff:2, ai:"Brown fat, often dubbed the body's internal furnace, plays a key role in regulating temperature and energy balance.", why:"The AI one uses a nickname and \"plays a key role\". The human one explains what brown fat actually does."},
  {h:"sleep", diff:1, ai:"In a world where sleep is often sacrificed, understanding its intricate connection to heart health has never been more crucial.", why:"\"In a world where…\", \"intricate connection\", \"never been more crucial\". Three AI habits in one sentence."},
  {h:"seasonend", diff:2, ai:"While the season may be officially winding down, residents are reminded that the threat of storms never truly disappears.", why:"The AI one is vaguer (no date) and more dramatic (\"never truly disappears\"). NOAA gives Nov. 30."},
  {h:"average", diff:2, ai:"An average hurricane season produces around a dozen named storms, though the exact number can vary considerably from year to year.", why:"The human one gives exact numbers. The AI one hedges with \"around a dozen\" and \"vary considerably\"."},
  {h:"neutrons", diff:1, ai:"Using a sophisticated experimental setup, scientists carefully measure the behavior of neutrons to unlock the secrets of the subatomic world.", why:"\"Sophisticated setup\" and \"unlock the secrets\". The human one says exactly what happens: shoot, decay, catch, count."},
  {h:"vault", diff:1, ai:"From its humble beginnings in a vault near Paris to its modern redefinition, the kilogram's journey reflects humanity's enduring quest for accuracy.", why:"\"From X to Y\" and \"humanity's enduring quest\" are AI storytelling templates. The human one gives the date."},
  {h:"y1960", diff:2, ai:"For much of modern history, the kilogram remained uniquely tied to a physical object, a fascinating quirk in the world of measurement.", why:"\"For much of modern history\" is vague where the human one says 1960, and \"a fascinating quirk\" adds commentary."},
  {h:"quakes", diff:2, ai:"Earthquakes on our home planet are a familiar phenomenon, driven by the restless movement of the tectonic plates beneath our feet.", why:"Close call. \"Our home planet\", \"restless\" and \"beneath our feet\" decorate a fact the human one states plainly."},
  {h:"examining", diff:1, ai:"Scientists are now delving deeper into the data to unravel the mysteries hidden within these faint but meaningful signals.", why:"\"Delving\" and \"unravel the mysteries\" are classic AI wording. The human line is plain and slightly awkward."},
  {h:"kilauea", diff:1, ai:"The eruption reshaped the landscape in profound ways, serving as a powerful testament to the dynamic and ever-changing nature of our planet.", why:"\"A testament to\" and \"ever-changing nature\". The human one is technical and full of real place names."},
  {h:"payroll", diff:1, ai:"The labor market continued to show resilience in September, adding a solid number of jobs across key sectors.", why:"\"Resilience\", \"a solid number\", \"key sectors\". The human one gives the exact 136,000."},
  {h:"earnings", diff:2, ai:"Workers in education and health services saw their weekly paychecks hold steady, reflecting the sector's vital role in the economy.", why:"The AI one adds a lesson (\"vital role in the economy\") and drops the actual figure, $908.04."},
  {h:"wealth", diff:2, ai:"For many American families, the home and retirement savings remain the cornerstones of financial security.", why:"\"Cornerstones of financial security\" is a cliché. The human one just gives 61.7%."},
  {h:"senescent", diff:1, ai:"Clearing out aging zombie cells may hold the key to protecting the brain from the ravages of disease.", why:"\"Zombie cells\", \"hold the key\", \"ravages of disease\". The human one says what was done and that it was in mice."},
  {h:"insulin", diff:1, ai:"Scientists have developed an innovative capsule that could one day transform how millions of people manage diabetes.", why:"\"Innovative\", \"could one day transform\", \"millions of people\". The human one describes the capsule's actual job."},
  {h:"mfg", diff:2, ai:"As the manufacturing workforce grows older, companies face mounting pressure to attract and retain the next generation of talent.", why:"Smooth and polished (\"mounting pressure\", \"next generation of talent\"). The human one is a clunky run-on with a real statistic."},
  {h:"lng", diff:2, ai:"Australia Poised to Dominate the Global LNG Market", why:"\"Poised to dominate\" is dramatic. The real EIA headline says \"on track to become world's largest\", which is literal and checkable."},
  {h:"refinery", diff:1, ai:"U.S. Refineries Face Uncertain Road Ahead Amid Shifting Demand", why:"\"Uncertain road ahead\" and \"shifting demand\" are vague. The human headline makes one specific claim."},
  {h:"wages", diff:2, ai:"Paychecks Stretch Further as Workers See Meaningful Gains", why:"\"Meaningful gains\" without a number. The human one gives 4.7 percent and exact months."},
  {h:"peas", diff:1, ai:"Home Canning Safety: What Every Family Needs to Know", why:"A generic advice title. The human one names the food, the city and the year."},
  {h:"grandeur", diff:2, ai:"When we look upon the humble beetle in the hedgerow, we behold not a lesser creature, but a quiet testament to the patient artistry of ages.", why:"The AI imitation of Darwin uses \"a testament to\" and \"not X, but Y\". The real Darwin is clunkier and more careful."}
];

// Format 3: Find the AI sentence. Human sentences come from the named source(s), stitched around one AI line.
const PARAS = [
  {diff:2, s:"jpl", parts:[
    {h:"quakes"},
    {ai:"Mars, however, offers a uniquely tantalizing window into how rocky worlds evolve over billions of years."},
    {h:"examining"}], why:"\"Uniquely tantalizing window\" is AI decoration. The real JPL lines are plain statements of fact."},
  {diff:2, s:"noaa", parts:[
    {h:"average"},
    {ai:"This year's relentless parade of storms served as a stark reminder of nature's formidable power."},
    {h:"seasonend"}], why:"\"Relentless parade\", \"stark reminder\", \"formidable power\". NOAA's sentences give numbers and dates."},
  {diff:3, s:"nistk", parts:[
    {h:"y1960"},
    {ai:"This reliance on a single physical object meant that even the tiniest change to it could quietly ripple through every measurement on Earth."},
    {h:"vault"}], why:"Subtle. \"Quietly ripple through every measurement on Earth\" is a dramatic flourish. The NIST lines stick to dates and facts.", srcName:"NIST pages, 2018–2019"},
  {diff:2, s:"nisti", parts:[
    {h:"neutrons"},
    {ai:"This meticulous process enables researchers to unlock profound insights into the fundamental fabric of the universe."},
    {h:"nine"}], why:"\"Meticulous process\", \"unlock profound insights\", \"fundamental fabric\". Three AI phrases in a row."},
  {diff:2, s:"bls1", parts:[
    {h:"payroll"},
    {ai:"This steady growth paints an encouraging picture of an economy that continues to defy expectations."},
    {h:"healthjobs"}], why:"\"Paints an encouraging picture\" and \"continues to defy expectations\" are commentary. The BLS lines only report numbers."}
];
