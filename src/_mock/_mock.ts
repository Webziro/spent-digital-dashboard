import { Publication, fetchPublications } from 'src/api/publications';

// Runtime cache for live publications fetched from the API. Filled asynchronously below.
let livePosts: Publication[] = [];

// Initiate fetching publications at module load. Consumers can await `postsPromise`.
export const postsPromise = (async function fetchAndCachePosts() {
  try {
    const list = await fetchPublications();
    if (Array.isArray(list) && list.length) {
      livePosts = list;
    }
    return livePosts;
  } catch {
    // ignore errors and keep fallback mock data
    return [] as Publication[];
  }
})();

export const _id = (index: number) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index}`;

export const _times = (index: number) =>
  // 'MM/DD/YYYY'
  [
    '11/08/2023',
    '04/09/2024',
    '09/12/2023',
    '01/01/2024',
    '04/23/2024',
    '02/29/2024',
    '05/14/2024',
    '01/13/2024',
    '06/22/2024',
    '10/05/2023',
    '07/11/2024',
    '05/22/2024',
    '03/29/2024',
    '08/29/2023',
    '11/19/2023',
    '10/24/2023',
    '12/02/2023',
    '02/13/2024',
    '09/19/2023',
    '04/17/2024',
    '12/18/2023',
    '06/27/2024',
    '10/19/2023',
    '08/09/2024',
  ][index];

export const _fullName = (index: number) =>
  [
    'Billy Stoltenberg',
    'Eloise Ebert',
    'Teresa Luettgen',
    'Salvador Mayert',
    'Dr. Guadalupe Rath',
    'Kelvin Pouros',
    'Thelma Langworth',
    'Kristen Wunsch',
    'Steve Welch',
    'Brian Jacobs',
    'Lillie Schultz',
    'Mr. Conrad Spinka',
    'Charlene Krajcik',
    'Kerry Kuhlman',
    'Betty Hammes',
    'Tony Paucek PhD',
    'Sherri Davis',
    'Angel Rolfson-Kulas',
    'Dr. Lee Doyle-Grant',
    'Cheryl Romaguera',
    'Billy Braun',
    'Adam Trantow',
    'Brandon Von',
    'Willis Ankunding',
  ][index];

export const _price = (index: number) =>
  [
    35.17, 57.22, 64.78, 50.79, 9.57, 61.46, 96.73, 63.04, 33.18, 36.3, 54.42, 20.52, 62.82, 19.96,
    25.93, 70.39, 23.11, 67.23, 14.31, 31.5, 26.72, 44.8, 37.87, 75.53,
  ][index];

export const _company = (index: number) =>
  [
    'Medhurst, Moore and Franey',
    'Hahn, Homenick and Lind',
    'Larkin LLC',
    'Stamm, Larson and Mertz',
    'Spencer, Raynor and Langosh',
    'Lehner - Feeney',
    'Leuschke, Harris and Kuhlman',
    'Gutmann - Kassulke',
    'Turcotte - Runolfsson',
    'Howe - Anderson',
    'Sipes - Yost',
    'Johns - Aufderhar',
    'Schmidt LLC',
    'Smitham - Gerlach',
    'Waelchi - VonRueden',
    'Padberg - Macejkovic',
    'Lemke - Ferry',
    'Koch and Sons',
    'Klein - Rolfson',
    'Weimann LLC',
    'White, Cassin and Goldner',
    'Mohr, Langworth and Hills',
    'Mitchell, Volkman and Prosacco',
    'Streich Group',
  ][index];

export const _boolean = (index: number) =>
  [
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    true,
    false,
  ][index];

export const _postTitles = (index: number) => {
  // If live posts have been fetched, prefer their titles (wrap index to available length)
  if (Array.isArray(livePosts) && livePosts.length) {
    const i = index % livePosts.length;
    return livePosts[i].title ?? `Publication ${i + 1}`;
  }
  // Fallback static titles
  return ['Whiteboard Templates By Industry Leaders'][index];
};

export const _description = (index: number) => {
  if (Array.isArray(livePosts) && livePosts.length) {
    const i = index % livePosts.length;
    // prefer `description` then `abstract` then `summary` fields from the publication
    return (
      livePosts[i].description || livePosts[i].abstract || livePosts[i].summary || `Publication description ${i + 1}`
    );
  }
  return [
    'The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J',
  ][index];
};



export const _productNames = (index: number) =>
  [
    'Nike Air Force 1 NDESTRUKT',
    'Nike Space Hippie 04',
    'Nike Air Zoom Pegasus 37 A.I.R. Chaz Bear',
    'Nike Blazer Low 77 Vintage',
    'Nike ZoomX SuperRep Surge',
    'Zoom Freak 2',
    'Nike Air Max Zephyr',
    'Jordan Delta',
    'Air Jordan XXXV PF',
    'Nike Waffle Racer Crater',
    'Kyrie 7 EP Sisterhood',
    'Nike Air Zoom BB NXT',
    'Nike Air Force 1 07 LX',
    'Nike Air Force 1 Shadow SE',
    'Nike Air Zoom Tempo NEXT%',
    'Nike DBreak-Type',
    'Nike Air Max Up',
    'Nike Air Max 270 React ENG',
    'NikeCourt Royale',
    'Nike Air Zoom Pegasus 37 Premium',
    'Nike Air Zoom SuperRep',
    'NikeCourt Royale',
    'Nike React Art3mis',
    'Nike React Infinity Run Flyknit A.I.R. Chaz Bear',
  ][index];
