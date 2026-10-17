import React from 'react';
import { DifficultyType, GameModeType } from '../types/index.ts';

/**
 * Returns the font size for the badge letter based on its length
 */
function getFontSize(text: string): number {
  if (text.length <= 1) return 20;
  if (text.length === 2) return 14;
  if (text.length === 3) return 11;
  return 9;
}

/**
 * Determines which of the 5 badge designs to use:
 * - Every tier has its own badge (1 to 4)
 * - Badge 5 (with the double ribbon) is reserved for the best possible grades of any tier (100% completion or speedrun victory)
 */
export function getBadgeTierIndex(params: {
  difficulty: DifficultyType;
  gameMode: GameModeType;
  completedTasks: number;
  totalTasks: number;
  isSpeedrunSuccess?: boolean;
}): 1 | 2 | 3 | 4 | 5 {
  const { difficulty, gameMode, completedTasks, totalTasks, isSpeedrunSuccess } = params;
  const allTasksDone = totalTasks > 0 && completedTasks >= totalTasks;

  // Badge 5 (Double Ribbon): For best possible grades / maximum completion of any tier
  if (allTasksDone || (gameMode === 'speedrun' && isSpeedrunSuccess)) {
    return 5;
  }

  // Speedrun when overtime or partial
  if (gameMode === 'speedrun') {
    return 3;
  }

  // Tier 1: Daily Mission / Maintenance (Patrol Tier) -> Badge 1 (Silver Ribbon)
  if (difficulty === 'maintenance') {
    return 1;
  }

  // Tier 2: Side Quests (Specialist Tier) -> Badge 2 (Vibrant Blue Ribbon)
  if (difficulty === 'specific') {
    return 2;
  }

  // Tier 3: Boss Fight (Special Ops Tier) -> Badge 3 (Dual-ring Blue Ribbon)
  if (difficulty === 'deep') {
    return 3;
  }

  // Tier 4: Main Quest (Supreme Tier) -> Badge 4 (Gold & Purple Ribbon)
  return 4;
}

/**
 * Generates self-contained SVG string with the 5 provided designs,
 * with numbers replaced by custom rank letters.
 */
export function getBadgeSvgString(badgeIndex: 1 | 2 | 3 | 4 | 5, letter: string): string {
  const cleanLetter = (letter || 'A').toUpperCase().trim().slice(0, 4);
  const fontSize = getFontSize(cleanLetter);

  switch (badgeIndex) {
    case 1:
      return `<svg class="animated_badge_svg" width="75" height="100" viewBox="0 0 75 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="badge_ribbon left"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="#A5ACB9" />
  <path class="badge_ribbon left"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="url(#b1_paint0_linear)" />
  <mask id="b1_mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="16" y="57" width="44" height="43">
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="#999999" />
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="url(#b1_paint1_linear)" />
  </mask>
  <g class="badge_ribbon left" mask="url(#b1_mask0)">
    <rect x="30" y="60" width="15" height="40" fill="#EAEDF2" />
  </g>
  <circle class="badge_circle" cx="37.5" cy="37.5" r="33.5" fill="#C0C6CF" stroke="#777E8B" stroke-width="8" />
  <text class="badge_letter" x="37.5" y="38" font-family="'Press Start 2P', monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(1px 2px 0px rgba(0,0,0,0.6));">${cleanLetter}</text>
  <defs>
    <linearGradient id="b1_paint0_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#616468" />
      <stop offset="1" stop-color="#A5ACB9" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b1_paint1_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>`;

    case 2:
      return `<svg class="animated_badge_svg" width="75" height="100" viewBox="0 0 75 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="badge_ribbon"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="#71A1F4" />
  <path class="badge_ribbon"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="url(#b2_paint0_linear)" />
  <mask id="b2_mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="16" y="57" width="44" height="43">
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="#71A1F4" />
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="url(#b2_paint1_linear)" />
  </mask>
  <g class="badge_ribbon" mask="url(#b2_mask0)">
    <rect x="30" y="60" width="15" height="40" fill="#ABC7F9" />
  </g>
  <circle class="badge_circle" cx="37.5" cy="37.5" r="33.5" fill="#71A1F4" stroke="#CEDCF5" stroke-width="8" />
  <text class="badge_letter" x="37.5" y="38" font-family="'Press Start 2P', monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(1px 2px 0px rgba(0,0,0,0.6));">${cleanLetter}</text>
  <defs>
    <linearGradient id="b2_paint0_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b2_paint1_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>`;

    case 3:
      return `<svg class="animated_badge_svg" width="75" height="100" viewBox="0 0 75 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="badge_ribbon"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="#71A1F4" />
  <path class="badge_ribbon"
    d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
    fill="url(#b3_paint0_linear)" />
  <mask id="b3_mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="16" y="57" width="44" height="43">
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="#71A1F4" />
    <path
      d="M16 86.7506V62C16 59.2386 18.2386 57 21 57H55C57.7614 57 60 59.2386 60 62V86.8112C60 88.7561 58.8722 90.5246 57.1087 91.3448L40.5616 99.0411C39.2517 99.6504 37.7424 99.6633 36.4223 99.0766L18.9693 91.3197C17.1637 90.5172 16 88.7266 16 86.7506Z"
      fill="url(#b3_paint1_linear)" />
  </mask>
  <g class="badge_ribbon" mask="url(#b3_mask0)">
    <rect x="23" y="60" width="8" height="40" fill="#ABC7F9" />
    <rect x="43" y="60" width="8" height="40" fill="#ABC7F9" />
  </g>
  <circle cx="37.5" cy="37.5" r="33.5" fill="#C0C6CF" stroke="#C0C6CF" stroke-width="8" />
  <circle class="badge_circle" cx="37.5" cy="37.5" r="29.5" fill="#C0C6CF" stroke="#EAEDF2" stroke-width="4" />
  <text class="badge_letter" x="37.5" y="38" font-family="'Press Start 2P', monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(1px 2px 0px rgba(0,0,0,0.6));">${cleanLetter}</text>
  <defs>
    <linearGradient id="b3_paint0_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b3_paint1_linear" x1="38" y1="57" x2="38" y2="89.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>`;

    case 4:
      return `<svg class="animated_badge_svg" width="75" height="98" viewBox="0 0 75 98" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="badge_ribbon right"
    d="M18 96.2589L18 60C18 59.4477 18.4477 59 19 59H57.3843C57.9366 59 58.3843 59.4477 58.3843 60V96.2334C58.3843 96.9469 57.6586 97.4308 56.9999 97.1566L39.0269 89.6734C38.7859 89.573 38.5153 89.5709 38.2728 89.6674L19.3697 97.188C18.7131 97.4493 18 96.9656 18 96.2589Z"
    fill="#FCC838" />
  <path class="badge_ribbon right"
    d="M18 96.2589L18 60C18 59.4477 18.4477 59 19 59H57.3843C57.9366 59 58.3843 59.4477 58.3843 60V96.2334C58.3843 96.9469 57.6586 97.4308 56.9999 97.1566L39.0269 89.6734C38.7859 89.573 38.5153 89.5709 38.2728 89.6674L19.3697 97.188C18.7131 97.4493 18 96.9656 18 96.2589Z"
    fill="url(#b4_paint0_linear)" />
  <mask id="b4_mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="17" y="58" width="42" height="38">
    <path
      d="M18 90.3625V64C18 61.2386 20.2386 59 23 59H53.3843C56.1457 59 58.3843 61.2386 58.3843 64V90.2351C58.3843 93.8024 54.7557 96.2222 51.4624 94.851L40.5301 90.2992C39.3254 89.7977 37.9723 89.7869 36.7599 90.2693L24.8484 95.0083C21.5653 96.3145 18 93.8959 18 90.3625Z"
      fill="#71A1F4" />
    <path
      d="M18 90.3625V64C18 61.2386 20.2386 59 23 59H53.3843C56.1457 59 58.3843 61.2386 58.3843 64V90.2351C58.3843 93.8024 54.7557 96.2222 51.4624 94.851L40.5301 90.2992C39.3254 89.7977 37.9723 89.7869 36.7599 90.2693L24.8484 95.0083C21.5653 96.3145 18 93.8959 18 90.3625Z"
      fill="url(#b4_paint1_linear)" />
    <path
      d="M18 90.3625V64C18 61.2386 20.2386 59 23 59H53.3843C56.1457 59 58.3843 61.2386 58.3843 64V90.2351C58.3843 93.8024 54.7557 96.2222 51.4624 94.851L40.5301 90.2992C39.3254 89.7977 37.9723 89.7869 36.7599 90.2693L24.8484 95.0083C21.5653 96.3145 18 93.8959 18 90.3625Z"
      stroke="#8C62F5" />
  </mask>
  <g class="badge_ribbon right" mask="url(#b4_mask0)">
    <rect width="12.9378" height="46.9542" transform="matrix(0.99996 -0.008926 0.0199657 0.999801 32.0576 65.3011)"
      fill="#FCD977" />
  </g>
  <circle cx="37.5" cy="37.5" r="33.5" fill="#DBDFE7" stroke="#8C62F5" stroke-width="8" />
  <circle class="badge_circle" cx="37.5" cy="37.5" r="29.5" fill="#8C62F5" stroke="#D1C0FB" stroke-width="4" />
  <text class="badge_letter" x="37.5" y="38" font-family="'Press Start 2P', monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#E3D9FC" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(1px 2px 0px rgba(0,0,0,0.6));">${cleanLetter}</text>
  <defs>
    <linearGradient id="b4_paint0_linear" x1="38.1921" y1="59" x2="38.1921" y2="97.1461" gradientUnits="userSpaceOnUse">
      <stop stop-color="#DFAC28" />
      <stop offset="1" stop-color="#FCC838" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b4_paint1_linear" x1="38.1921" y1="59" x2="38.1921" y2="97.1461" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>`;

    case 5:
      return `<svg class="animated_badge_svg" width="84" height="99" viewBox="0 0 84 99" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="badge_ribbon"
    d="M0.761166 82.9447L17.3041 50.8886C17.5574 50.3979 18.1606 50.2053 18.6513 50.4586L43.875 63.4756C44.3658 63.7289 44.5583 64.332 44.305 64.8228L27.7788 96.8466C27.4294 97.5236 26.4817 97.5769 26.0586 96.9435L17.8756 84.694C17.6881 84.4133 17.3716 84.2461 17.0341 84.2495L1.65981 84.4033C0.906487 84.4108 0.415676 83.6142 0.761166 82.9447Z"
    fill="#F04152" />
  <path class="badge_ribbon"
    d="M0.761166 82.9447L17.3041 50.8886C17.5574 50.3979 18.1606 50.2053 18.6513 50.4586L43.875 63.4756C44.3658 63.7289 44.5583 64.332 44.305 64.8228L27.7788 96.8466C27.4294 97.5236 26.4817 97.5769 26.0586 96.9435L17.8756 84.694C17.6881 84.4133 17.3716 84.2461 17.0341 84.2495L1.65981 84.4033C0.906487 84.4108 0.415676 83.6142 0.761166 82.9447Z"
    fill="url(#b5_paint0_linear)" />
  <mask id="b5_mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="1" y="50" width="44" height="46">
    <path
      d="M3.80623 77.0441L15.4697 54.4432C16.7361 51.9893 19.752 51.0266 22.2059 52.293L40.3204 61.6412C42.7743 62.9076 43.737 65.9235 42.4707 68.3774L30.8904 90.817C29.1437 94.2016 24.4052 94.4685 22.2895 91.3014L19.0777 86.4935C18.1402 85.09 16.5578 84.2543 14.8701 84.2712L8.29946 84.3369C4.53283 84.3745 2.07879 80.3915 3.80623 77.0441Z"
      fill="#71A1F4" />
    <path
      d="M3.80623 77.0441L15.4697 54.4432C16.7361 51.9893 19.752 51.0266 22.2059 52.293L40.3204 61.6412C42.7743 62.9076 43.737 65.9235 42.4707 68.3774L30.8904 90.817C29.1437 94.2016 24.4052 94.4685 22.2895 91.3014L19.0777 86.4935C18.1402 85.09 16.5578 84.2543 14.8701 84.2712L8.29946 84.3369C4.53283 84.3745 2.07879 80.3915 3.80623 77.0441Z"
      fill="url(#b5_paint1_linear)" />
  </mask>
  <g class="badge_ribbon" mask="url(#b5_mask0)">
    <rect width="9.73445" height="46.9502" transform="matrix(0.894023 0.448022 -0.445194 0.895434 24.272 60.4499)"
      fill="#FCD977" />
  </g>
  <path class="badge_ribbon right"
    d="M56.5365 97.1074L38.5 65.8673C38.2239 65.389 38.3877 64.7774 38.866 64.5013L63.4476 50.3091C63.9259 50.0329 64.5375 50.1968 64.8137 50.6751L82.832 81.8838C83.2129 82.5435 82.7458 83.3698 81.9841 83.3836L67.2552 83.6511C66.9177 83.6572 66.6061 83.8332 66.4266 84.1191L58.2494 97.1392C57.8487 97.7772 56.9132 97.7598 56.5365 97.1074Z"
    fill="#F04152" />
  <path class="badge_ribbon right"
    d="M56.5365 97.1074L38.5 65.8673C38.2239 65.389 38.3877 64.7774 38.866 64.5013L63.4476 50.3091C63.9259 50.0329 64.5375 50.1968 64.8137 50.6751L82.832 81.8838C83.2129 82.5435 82.7458 83.3698 81.9841 83.3836L67.2552 83.6511C66.9177 83.6572 66.6061 83.8332 66.4266 84.1191L58.2494 97.1392C57.8487 97.7772 56.9132 97.7598 56.5365 97.1074Z"
    fill="url(#b5_paint2_linear)" />
  <mask id="b5_mask1" mask-type="alpha" maskUnits="userSpaceOnUse" x="38" y="49" width="45" height="47">
    <path
      d="M53.2165 91.357L40.5 69.3314C39.1193 66.9399 39.9387 63.882 42.3301 62.5013L59.9835 52.3091C62.375 50.9283 65.4329 51.7477 66.8137 54.1392L79.4394 76.0076C81.3438 79.3061 79.0082 83.4376 75.2001 83.5068L69.419 83.6118C67.7314 83.6424 66.1732 84.5224 65.2756 85.9517L61.7808 91.5162C59.7774 94.7061 55.0999 94.6192 53.2165 91.357Z"
      fill="#71A1F4" />
    <path
      d="M53.2165 91.357L40.5 69.3314C39.1193 66.9399 39.9387 63.882 42.3301 62.5013L59.9835 52.3091C62.375 50.9283 65.4329 51.7477 66.8137 54.1392L79.4394 76.0076C81.3438 79.3061 79.0082 83.4376 75.2001 83.5068L69.419 83.6118C67.7314 83.6424 66.1732 84.5224 65.2756 85.9517L61.7808 91.5162C59.7774 94.7061 55.0999 94.6192 53.2165 91.357Z"
      fill="url(#b5_paint3_linear)" />
  </mask>
  <g class="badge_ribbon right" mask="url(#b5_mask1)">
    <rect width="9.73445" height="46.9502" transform="matrix(0.860033 -0.510239 0.512954 0.858416 50.3103 65.1699)"
      fill="#FCD977" />
  </g>
  <circle cx="40.5" cy="37.5" r="33.5" fill="#DBDFE7" stroke="#FCD977" stroke-width="8" />
  <circle class="badge_circle" cx="40.5" cy="37.5" r="29.5" fill="#FCD977" stroke="#FFA826" stroke-width="4" />
  <text class="badge_letter" x="40.5" y="38" font-family="'Press Start 2P', monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#B32B00" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(1px 1px 0px rgba(255,255,255,0.7));">${cleanLetter}</text>
  <defs>
    <linearGradient id="b5_paint0_linear" x1="31.2632" y1="56.9671" x2="13.7695" y2="90.8654" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A31523" />
      <stop offset="1" stop-color="#F04152" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b5_paint1_linear" x1="31.2632" y1="56.9671" x2="13.7695" y2="90.8654" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b5_paint2_linear" x1="51.1568" y1="57.4052" x2="70.2299" y2="90.4407" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A31523" />
      <stop offset="1" stop-color="#F04152" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="b5_paint3_linear" x1="51.1568" y1="57.4052" x2="70.2299" y2="90.4407" gradientUnits="userSpaceOnUse">
      <stop stop-color="#27539F" />
      <stop offset="1" stop-color="#71A1F4" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>`;
  }
}

const badgeImageCache = new Map<string, HTMLImageElement>();

/**
 * Loads a badge SVG as an HTMLImageElement for canvas rendering
 */
export function loadBadgeImage(badgeIndex: 1 | 2 | 3 | 4 | 5, letter: string): Promise<HTMLImageElement> {
  const cleanLetter = (letter || 'A').toUpperCase().trim().slice(0, 4);
  const cacheKey = `${badgeIndex}_${cleanLetter}`;

  if (badgeImageCache.has(cacheKey)) {
    return Promise.resolve(badgeImageCache.get(cacheKey)!);
  }

  return new Promise((resolve, reject) => {
    const svgStr = getBadgeSvgString(badgeIndex, cleanLetter);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      badgeImageCache.set(cacheKey, img);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

export interface TrophyBadgeProps {
  badgeIndex: 1 | 2 | 3 | 4 | 5;
  letter: string;
  className?: string;
}

export const TrophyBadge: React.FC<TrophyBadgeProps> = ({
  badgeIndex,
  letter,
  className = '',
}) => {
  const svgHtml = getBadgeSvgString(badgeIndex, letter);

  return (
    <div
      className={`animated_badge animated_badge_${badgeIndex} ${className}`}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};
