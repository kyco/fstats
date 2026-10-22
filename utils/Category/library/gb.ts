import { CategoryRuleDirection, Country } from '@/types-enums'

import { defineLibraryPack } from '../definition'

/**
 * United Kingdom.
 */
export const gbPack = defineLibraryPack({
  id: 'gb',
  libraryKeywords: [
    // Income
    {
      id: 'dwp',
      name: 'DWP',
      tag: 'benefits',
      keywords: ['DWP', 'CHILD BENEFIT', 'UNIVERSAL CREDIT'],
      direction: CategoryRuleDirection.IN,
      examples: ['DWP UC 1234567890', 'HMRC CHILD BENEFIT'],
    },

    // Housing
    {
      id: 'council_tax',
      name: 'Council Tax',
      tag: 'property_tax',
      keywords: ['COUNCIL TAX'],
      examples: ['LONDON BOROUGH COUNCIL TAX 12345678'],
    },
    {
      id: 'british_gas',
      name: 'British Gas',
      tag: 'energy',
      keywords: ['BRITISH GAS'],
      examples: ['BRITISH GAS 850012345678'],
    },
    {
      id: 'octopus_energy',
      name: 'Octopus Energy',
      tag: 'energy',
      keywords: ['OCTOPUS ENERGY'],
      examples: ['OCTOPUS ENERGY A-1B2C3D4E'],
    },
    {
      id: 'edf',
      name: 'EDF',
      tag: 'energy',
      keywords: ['EDF ENERGY'],
      examples: ['EDF ENERGY 671234567890'],
    },
    {
      id: 'ovo',
      name: 'OVO',
      tag: 'energy',
      keywords: ['OVO ENERGY'],
      examples: ['OVO ENERGY 1234567'],
    },
    {
      id: 'scottish_power',
      name: 'ScottishPower',
      tag: 'energy',
      keywords: ['SCOTTISH POWER', 'SCOTTISHPOWER'],
      examples: ['SCOTTISHPOWER 1234567890'],
    },
    {
      id: 'thames_water',
      name: 'Thames Water',
      tag: 'water',
      keywords: ['THAMES WATER'],
      examples: ['THAMES WATER 9012345678'],
    },
    {
      id: 'severn_trent',
      name: 'Severn Trent',
      tag: 'water',
      keywords: ['SEVERN TRENT'],
      examples: ['SEVERN TRENT WATER 1234'],
    },
    {
      id: 'anglian_water',
      name: 'Anglian Water',
      tag: 'water',
      keywords: ['ANGLIAN WATER'],
      examples: ['ANGLIAN WATER 1234'],
    },
    {
      id: 'southern_water',
      name: 'Southern Water',
      tag: 'water',
      keywords: ['SOUTHERN WATER'],
      examples: ['SOUTHERN WATER 1234'],
    },
    {
      id: 'b_and_q',
      name: 'B&Q',
      tag: 'diy',
      keywords: ['B&Q'],
      examples: ['B&Q 1234 CROYDON'],
    },
    {
      id: 'screwfix',
      name: 'Screwfix',
      tag: 'diy',
      keywords: ['SCREWFIX'],
      examples: ['SCREWFIX DIRECT'],
    },
    {
      id: 'wickes',
      name: 'Wickes',
      tag: 'diy',
      keywords: ['WICKES'],
      examples: ['WICKES 1234'],
    },

    // Telecom
    {
      id: 'bt',
      name: 'BT',
      tag: 'telecom',
      keywords: ['BT GROUP', 'BRITISH TELECOM'],
      examples: ['BT GROUP PLC'],
    },
    {
      id: 'sky',
      name: 'Sky',
      tag: 'telecom',
      keywords: ['SKY DIGITAL', 'SKY UK'],
      examples: ['SKY DIGITAL 1234567890'],
    },
    {
      id: 'virgin_media',
      name: 'Virgin Media',
      tag: 'internet',
      keywords: ['VIRGIN MEDIA'],
      examples: ['VIRGIN MEDIA PYMTS'],
    },
    {
      id: 'ee',
      name: 'EE',
      tag: 'mobile',
      keywords: ['EE LIMITED'],
      examples: ['EE LIMITED 1234567'],
    },
    {
      id: 'three',
      name: 'Three',
      tag: 'mobile',
      keywords: ['THREE.CO.UK', 'HUTCHISON 3G'],
      examples: ['HUTCHISON 3G UK LTD'],
    },
    {
      id: 'o2',
      name: 'O2',
      tag: 'mobile',
      keywords: ['O2 UK', 'TELEFONICA UK'],
      examples: ['TELEFONICA UK LTD'],
    },

    // Groceries
    {
      id: 'tesco',
      name: 'Tesco',
      tag: 'supermarket',
      keywords: ['TESCO'],
      examples: ['TESCO STORES 1234', 'TESCO EXPRESS 5678'],
    },
    {
      id: 'sainsburys',
      name: "Sainsbury's",
      tag: 'supermarket',
      keywords: ["SAINSBURY'S", 'SAINSBURYS'],
      examples: ["SAINSBURY'S S/MKTS", 'SAINSBURYS SACAT 1234'],
    },
    {
      id: 'asda',
      name: 'Asda',
      tag: 'supermarket',
      keywords: ['ASDA'],
      examples: ['ASDA STORES 1234'],
    },
    {
      id: 'morrisons',
      name: 'Morrisons',
      tag: 'supermarket',
      keywords: ['MORRISONS', 'WM MORRISON'],
      examples: ['WM MORRISON STORE 123'],
    },
    {
      id: 'waitrose',
      name: 'Waitrose',
      tag: 'supermarket',
      keywords: ['WAITROSE'],
      examples: ['WAITROSE 1234'],
    },
    {
      id: 'iceland',
      name: 'Iceland',
      tag: 'supermarket',
      keywords: ['ICELAND FOODS'],
      examples: ['ICELAND FOODS 1234'],
    },
    {
      id: 'marks_and_spencer',
      name: 'M&S',
      tag: 'general_stores',
      keywords: ['M&S', 'MARKS & SPENCER', 'MARKS AND SPENCER', 'MARKS&SPENCER'],
      examples: ['M&S SIMPLY FOOD 1234', 'MARKS&SPENCER PLC'],
    },

    // Food
    {
      id: 'greggs',
      name: 'Greggs',
      tag: 'fast_food',
      keywords: ['GREGGS'],
      examples: ['GREGGS PLC 1234'],
    },
    {
      id: 'pret',
      name: 'Pret A Manger',
      tag: 'coffee',
      keywords: ['PRET A MANGER'],
      examples: ['PRET A MANGER 123'],
    },
    {
      id: 'costa',
      name: 'Costa Coffee',
      tag: 'coffee',
      keywords: ['COSTA COFFEE'],
      examples: ['COSTA COFFEE 43012'],
    },

    // Transport
    {
      id: 'tfl',
      name: 'Transport for London',
      tag: 'public_transport',
      keywords: ['TFL', 'TRANSPORT FOR LONDON'],
      examples: ['TFL TRAVEL CH', 'TFL.GOV.UK/CP'],
    },
    {
      id: 'trainline',
      name: 'Trainline',
      tag: 'public_transport',
      keywords: ['TRAINLINE'],
      examples: ['TRAINLINE.COM'],
    },
    {
      id: 'ringgo',
      name: 'RingGo',
      tag: 'parking',
      keywords: ['RINGGO'],
      examples: ['RINGGO 01234'],
    },
    {
      id: 'ncp',
      name: 'NCP',
      tag: 'parking',
      keywords: ['NCP'],
      countries: [Country.GB],
      examples: ['NCP LIMITED 1234'],
    },
    {
      id: 'justpark',
      name: 'JustPark',
      tag: 'parking',
      keywords: ['JUSTPARK'],
      examples: ['JUSTPARK 1234'],
    },
    {
      id: 'dart_charge',
      name: 'Dart Charge',
      tag: 'tolls',
      keywords: ['DART CHARGE', 'DARTFORD CROSSING'],
      examples: ['DART CHARGE 1234'],
    },
    {
      id: 'dvla',
      name: 'DVLA',
      tag: 'car',
      keywords: ['DVLA'],
      examples: ['DVLA-AB12CDE'],
    },
    {
      id: 'wightlink',
      name: 'Wightlink',
      tag: 'ferry',
      keywords: ['WIGHTLINK'],
      examples: ['WIGHTLINK LTD'],
    },
    {
      id: 'red_funnel',
      name: 'Red Funnel',
      tag: 'ferry',
      keywords: ['RED FUNNEL'],
      examples: ['RED FUNNEL FERRIES'],
    },

    // Health & insurance
    {
      id: 'boots',
      name: 'Boots',
      tag: 'pharmacy',
      keywords: ['BOOTS'],
      countries: [Country.GB],
      examples: ['BOOTS 1234'],
    },
    {
      id: 'superdrug',
      name: 'Superdrug',
      tag: 'drugstore',
      keywords: ['SUPERDRUG'],
      examples: ['SUPERDRUG 1234'],
    },
    {
      id: 'puregym',
      name: 'PureGym',
      tag: 'fitness',
      keywords: ['PUREGYM', 'PURE GYM'],
      examples: ['PUREGYM LTD'],
    },
    {
      id: 'the_gym_group',
      name: 'The Gym Group',
      tag: 'fitness',
      keywords: ['THE GYM GROUP', 'GYM GROUP'],
      examples: ['THE GYM GROUP LTD'],
    },
    {
      id: 'aviva',
      name: 'Aviva',
      tag: 'insurance',
      keywords: ['AVIVA'],
      examples: ['AVIVA INSURANCE LTD'],
    },
    {
      id: 'admiral',
      name: 'Admiral',
      tag: 'vehicle_insurance',
      keywords: ['ADMIRAL INSURANCE'],
      examples: ['ADMIRAL INSURANCE 12345'],
    },
    {
      id: 'direct_line',
      name: 'Direct Line',
      tag: 'insurance',
      keywords: ['DIRECT LINE'],
      examples: ['DIRECT LINE INS'],
    },

    // Shopping
    {
      id: 'argos',
      name: 'Argos',
      tag: 'general_stores',
      keywords: ['ARGOS'],
      examples: ['ARGOS LTD 1234'],
    },
    {
      id: 'john_lewis',
      name: 'John Lewis',
      tag: 'general_stores',
      keywords: ['JOHN LEWIS'],
      examples: ['JOHN LEWIS 123'],
    },
    {
      id: 'currys',
      name: 'Currys',
      tag: 'electronics',
      keywords: ['CURRYS'],
      examples: ['CURRYS 1234'],
    },
    {
      id: 'pets_at_home',
      name: 'Pets at Home',
      tag: 'pets',
      keywords: ['PETS AT HOME'],
      examples: ['PETS AT HOME 1234'],
    },

    // Finance
    {
      id: 'hmrc',
      name: 'HMRC',
      tag: 'tax',
      keywords: ['HMRC'],
      examples: ['HMRC SELF ASSESSMENT', 'HMRC NDDS'],
    },
  ],
})
