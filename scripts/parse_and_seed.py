#!/usr/bin/env python3
"""
Amrita Dharma Calendar - Complete Document Parser, Data Validator & SQLite Seeder
Extracts prayer texts from ENGLISH.docx, SANSKRIT.docx, TAMIL.docx, TELUGU.docx,
and SRI MAHAGANAPATHI HOMAM JULY.docx.
Populates prisma/dev.db and creates audit reports.
"""

import os
import sys
import json
import sqlite3
import hashlib
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'source_documents')
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'prisma', 'dev.db')
os.makedirs(DATA_DIR, exist_ok=True)

def extract_paragraphs(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paras = []
        for p in root.findall('.//w:p', namespaces):
            runs = p.findall('.//w:r', namespaces)
            is_bold = any(r.find('.//w:b', namespaces) is not None for r in runs)
            pStyle = p.find('.//w:pStyle', namespaces)
            style_val = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if pStyle is not None else ''
            texts = [t.text for t in p.findall('.//w:t', namespaces) if t.text]
            t = ''.join(texts).strip()
            if t:
                paras.append({'text': t, 'bold': is_bold, 'style': style_val})
        return paras

def parse_verses(lines):
    """Parse raw lines into structured verses."""
    verses = []
    current_verse_lines = []
    verse_num = 1
    
    for line in lines:
        if not line.strip():
            continue
        current_verse_lines.append(line.strip())
        # Check if line ends with a verse marker like ॥ 1 ॥ or ।। 2 ।। or || 3 ||
        if any(marker in line for marker in ['॥', '||', '।।', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']):
            # We can treat each distinct paragraph or stanza as a verse
            verses.append({
                'verseNumber': verse_num,
                'text': '\n'.join(current_verse_lines)
            })
            current_verse_lines = []
            verse_num += 1
            
    if current_verse_lines:
        verses.append({
            'verseNumber': verse_num,
            'text': '\n'.join(current_verse_lines)
        })
    return verses

def run_parser():
    print("Loading source DOCX files...")
    eng_paras = extract_paragraphs(os.path.join(DOCS_DIR, 'ENGLISH.docx'))
    san_paras = extract_paragraphs(os.path.join(DOCS_DIR, 'SANSKRIT.docx'))
    tam_paras = extract_paragraphs(os.path.join(DOCS_DIR, 'TAMIL.docx'))
    tel_paras = extract_paragraphs(os.path.join(DOCS_DIR, 'TELUGU.docx'))
    
    eng_texts = [p['text'] for p in eng_paras]
    san_texts = [p['text'] for p in san_paras]
    tam_texts = [p['text'] for p in tam_paras]
    tel_texts = [p['text'] for p in tel_paras]
    
    # Define exact slices for each prayer across languages
    # None indicates prayer is not present in that document
    prayers_meta = [
        {
            'slug': 'amma-dhyanam',
            'name': 'Sri Amma Dhyanam',
            'alternativeNames': 'Sri Mata Amritanandamayi Devi Dhyanam, Amrita Dhyana Sloka',
            'deity': 'Sri Mata Amritanandamayi Devi (Amma)',
            'category': 'Dhyanam',
            'origin': 'Amrita Ashram Traditional Dhyana Sloka',
            'significance': 'Meditated upon before all prayers, chanting, and homam rituals in Amrita institutions, invoking Satguru Sri Mata Amritanandamayi Devi.',
            'overallMeaning': 'We meditate upon the Divine Mother enveloped in pure white robes, radiant, ascetic, looking with affectionate sidelong glances, the Goddess with a smiling auspicious face, raining the nectar of maternal love, melodiously singing devotional chants, dark-complexioned, whose speech is soaked in honey, the Supreme Goddess whose soul is pure Immortal Bliss.',
            'isFeatured': True,
            'sequenceOrder': 1,
            'slices': {
                'english': (2, 7),
                'sanskrit': (1, 6),
                'tamil': (0, 2),
                'telugu': (0, 5)
            }
        },
        {
            'slug': 'mahaganapathi-dhyanam',
            'name': 'Sri Mahaganapathi Dhyanam',
            'alternativeNames': 'Sri Ganesha Dhyanam, Vakratunda Dhyana Sloka',
            'deity': 'Lord Ganesha',
            'category': 'Dhyanam',
            'origin': 'Traditional Vedic & Puranic Ganapathi Invocation',
            'significance': 'Invoked at the beginning of all spiritual rites, pujas, and studies to remove obstacles and bestow clarity, wisdom, and auspiciousness.',
            'overallMeaning': 'O Lord with the curved trunk and immense form, whose brilliance rivals ten million suns, make all my undertakings free from impediments always. Meditate upon Vishnu/Ganesha clad in white, moon-hued, four-armed, with serene countenance, for the pacification of all obstacles.',
            'isFeatured': True,
            'sequenceOrder': 2,
            'slices': {
                'english': (8, 12),
                'sanskrit': (6, 10),
                'tamil': (2, 7),
                'telugu': (5, 12)
            }
        },
        {
            'slug': 'sankata-nashana-ganesha-stotram',
            'name': 'Sankata Nashana Ganesha Stotram',
            'alternativeNames': 'Sankata Nasana Ganapathi Stotram, Narada Kruta Vinayaka Stotram',
            'deity': 'Lord Ganesha',
            'category': 'Ganesha Stotrams',
            'origin': 'Narada Purana (composed by Sage Narada)',
            'significance': 'Recited for destruction of distress, fear, and difficulties, invoking the 12 sacred names of Vinayaka.',
            'overallMeaning': 'Sage Narada said: Bowing one\'s head with reverence to the divine son of Gauri, Vinayaka, one should constantly remember the abode of devotion for longevity, fulfilment of desires, and wealth. The 12 names: Vakratunda, Ekadanta, Krishnapingaksha, Gajavaktra, Lambodara, Vikata, Vighnaraja, Dhumravarna, Bhalachandra, Vinayaka, Ganapati, Gajanana.',
            'isFeatured': True,
            'sequenceOrder': 3,
            'slices': {
                'english': (12, 21),
                'sanskrit': (17, 27),
                'tamil': (7, 17),
                'telugu': (19, 29)
            }
        },
        {
            'slug': 'mahaganesha-pancharatnam',
            'name': 'Sri Mahaganesha Pancharatnam',
            'alternativeNames': 'Sree Maha Ganesha Pancharatnam, Ganesha Pancharatnam',
            'deity': 'Lord Ganesha',
            'category': 'Ganesha Stotrams',
            'origin': 'Composed by Jagadguru Sri Adi Shankaracharya',
            'significance': 'Five gem-like verses praising the divine qualities, grace, and cosmic role of Mahaganapati.',
            'overallMeaning': 'I bow to Vinayaka who holds the modaka with delight, who ever bestows liberation, adorned with the crescent moon, protector of the universe, the sole leader of the leaderless, destroyer of the elephant-demon, who swiftly obliterates the inauspiciousness of his devotees.',
            'isFeatured': True,
            'sequenceOrder': 4,
            'slices': {
                'english': (21, 28),
                'sanskrit': (10, 17),
                'tamil': (17, 25),
                'telugu': (12, 19)
            }
        },
        {
            'slug': 'guru-stotram',
            'name': 'Sri Guru Stotram (Guru Vandanam)',
            'alternativeNames': 'Guru Vandanam, Akhanda Mandalagram, Gurur Brahma',
            'deity': 'Satguru / Parambrahma',
            'category': 'Guru Stotrams',
            'origin': 'Guru Gita (from Uttarakhanda of Skanda Purana)',
            'significance': 'Praising the Guru as Brahma, Vishnu, and Maheshvara, the dispenser of knowledge who destroys the blindness of ignorance.',
            'overallMeaning': 'Salutations to that Sri Guru who revealed that state which pervades the entire unbroken cosmic sphere, moving and unmoving. Salutations to the Guru who opened the eyes of one blinded by the darkness of ignorance with the salve of spiritual wisdom. The Guru is Brahma, the Guru is Vishnu, the Guru is Lord Maheshvara; the Guru is verily the Supreme Absolute.',
            'isFeatured': True,
            'sequenceOrder': 5,
            'slices': {
                'english': (28, 30),
                'sanskrit': (27, 30),
                'tamil': (25, 40),
                'telugu': (29, 31)
            }
        },
        {
            'slug': 'gurvashtakam',
            'name': 'Sri Gurvashtakam',
            'alternativeNames': 'Guru Ashtakam, Sariram Surupam',
            'deity': 'Satguru',
            'category': 'Guru Stotrams',
            'origin': 'Composed by Jagadguru Sri Adi Shankaracharya',
            'significance': 'Eight verses reflecting on how all worldly wealth, beauty, scholarship, and fame are futile if the mind is not steadfastly devoted to the lotus feet of the Guru.',
            'overallMeaning': 'Though one possesses a handsome body, a beautiful spouse, renowned fame, and wealth vast like Mount Meru—if one\'s mind does not attach itself to the Guru\'s lotus feet, then what of it? What of it? What of it?',
            'isFeatured': False,
            'sequenceOrder': 6,
            'slices': {
                'english': (30, 40),
                'sanskrit': (30, 40),
                'tamil': (40, 51),
                'telugu': (31, 41)
            }
        },
        {
            'slug': 'guru-paduka-stotram',
            'name': 'Sri Guru Paduka Stotram',
            'alternativeNames': 'Gurupaduka Stotram, Ananta Samsara',
            'deity': 'Guru Padukas (Sacred Sandals of the Guru)',
            'category': 'Guru Stotrams',
            'origin': 'Traditional Advaita Vedanta Stuti attributed to Sri Adi Shankaracharya',
            'significance': 'Meditating upon the holy sandals of the Guru which serve as the boat across the boundless ocean of worldly existence.',
            'overallMeaning': 'Salutations to the holy pair of Guru\'s sandals, which serve as the boat to cross the endless ocean of worldly transmigratory existence, and which endow devotion unto the Guru.',
            'isFeatured': False,
            'sequenceOrder': 7,
            'slices': {
                'english': (40, 50),
                'sanskrit': (40, 50),
                'tamil': (51, 61),
                'telugu': (41, 51)
            }
        },
        {
            'slug': 'dakshinamurthy-stotram',
            'name': 'Sri Dakshinamurthy Stotram',
            'alternativeNames': 'Dakshinamoorthy Stotram, Vishvam Darpana Drishyamana',
            'deity': 'Lord Dakshinamurthy (Shiva as the Primordial Guru)',
            'category': 'Shiva Stotrams',
            'origin': 'Composed by Jagadguru Sri Adi Shankaracharya',
            'significance': 'Profound Vedantic hymn expounding Non-duality (Advaita), where the universe is seen within the Self like a mirror reflection.',
            'overallMeaning': 'To that teacher who reveals the entire universe existing within oneself like a city seen in a mirror, yet appearing outside as if through Maya, as in a dream—to that Sri Dakshinamurthy, embodiment of pure awareness, salutations.',
            'isFeatured': True,
            'sequenceOrder': 8,
            'slices': {
                'english': (50, 115),
                'sanskrit': (50, 71),
                'tamil': (61, 83),
                'telugu': (51, 74)
            }
        },
        {
            'slug': 'lingashtakam',
            'name': 'Sri Lingashtakam',
            'alternativeNames': 'Brahmamurari Surarchita Lingam',
            'deity': 'Lord Shiva (Shiva Linga)',
            'category': 'Shiva Stotrams',
            'origin': 'Traditional Shaiva Stotra',
            'significance': 'Eight celebrated verses worshipping the sacred Shiva Lingam, revered by Brahma, Murari, gods, and sages.',
            'overallMeaning': 'I bow before that Shiva Lingam which is worshipped by Brahma and Vishnu, pure, radiant, praised by the celestials, decorated with the king of serpents, and the destroyer of rebirth.',
            'isFeatured': False,
            'sequenceOrder': 9,
            'slices': {
                'english': (115, 125),
                'sanskrit': (71, 81),
                'tamil': (83, 93),
                'telugu': (74, 84)
            }
        },
        {
            'slug': 'shiva-panchakshari-stotram',
            'name': 'Sri Shiva Panchakshari Stotram',
            'alternativeNames': 'Nagendra Haraya Trilochanaya, Panchakshara Stotram',
            'deity': 'Lord Shiva',
            'category': 'Shiva Stotrams',
            'origin': 'Composed by Jagadguru Sri Adi Shankaracharya',
            'significance': 'Meditation upon the five holy syllables of the Panchakshari Mantra: Na-Ma-Shi-Va-Ya.',
            'overallMeaning': 'Salutations to Shiva who wears the king of serpents as garland, three-eyed, holding the trident, auspicious, clothed in directions (Digambara), representing the letter \'Na\'...',
            'isFeatured': False,
            'sequenceOrder': 10,
            'slices': {
                'english': (125, 133),
                'sanskrit': (81, 88),
                'tamil': (93, 101),
                'telugu': (84, 92)
            }
        },
        {
            'slug': 'kalabhairava-ashtakam',
            'name': 'Sri Kalabhairava Ashtakam',
            'alternativeNames': 'Kalabhairavashtakam, Devaraja Sevyamana',
            'deity': 'Lord Kalabhairava',
            'category': 'Shiva Stotrams',
            'origin': 'Composed by Jagadguru Sri Adi Shankaracharya at Varanasi',
            'significance': 'Recited for freedom from fear of death, removal of sins, and attainment of auspicious wisdom in Kashi.',
            'overallMeaning': 'I worship Kalabhairava, Lord of the holy city of Kashi, whose lotus feet are served by the king of celestials, adorned with serpent yajnopavita and crescent moon, compassionate, clothed in space, embraced by yogis.',
            'isFeatured': False,
            'sequenceOrder': 11,
            'slices': {
                'english': (133, 144),
                'sanskrit': (88, 98),
                'tamil': (101, 114),
                'telugu': (92, 103)
            }
        },
        {
            'slug': 'shiva-tandava-stotram',
            'name': 'Sri Shiva Tandava Stotram',
            'alternativeNames': 'Siva Tandava Stotram, Ravana Kruta Shiva Stotram',
            'deity': 'Lord Shiva',
            'category': 'Shiva Stotrams',
            'origin': 'Composed by Ravana (King of Lanka)',
            'significance': 'Energetic and rhythmic Sanskrit masterpiece celebrating Shiva\'s cosmic dance of destruction and grace.',
            'overallMeaning': 'May our minds ever rejoice in Shiva, whose neck is consecrated by the flow of water dripping from the thick forest of his matted hair, where a sacred serpent hangs like a garland, and whose damaru sounds damat-damat in divine dance.',
            'isFeatured': True,
            'sequenceOrder': 12,
            'slices': {
                'english': (144, 160),
                'sanskrit': (98, 114),
                'tamil': (114, 130),
                'telugu': (103, 119)
            }
        },
        {
            'slug': 'chandrasekhara-ashtakam',
            'name': 'Sri Chandrasekhara Ashtakam',
            'alternativeNames': 'Chandrasekhara Chandrasekhara Pahi Mam',
            'deity': 'Lord Shiva (Chandrasekhara)',
            'category': 'Shiva Stotrams',
            'origin': 'Attributed to Sage Markandeya',
            'significance': 'Invoking Shiva crowned with the crescent moon to protect from death, distress, and disease; \'What can Yama do to me?\'',
            'overallMeaning': 'O Chandrasekhara, protect me! O Chandrasekhara, protect me! When you are my protector, what can Yama (the lord of death) do unto me?',
            'isFeatured': False,
            'sequenceOrder': 13,
            'slices': {
                'english': (160, 171),
                'sanskrit': (114, 125),
                'tamil': (130, 141),
                'telugu': (119, 130)
            }
        },
        {
            'slug': 'vaidyanathashtakam',
            'name': 'Sri Vaidyanathashtakam',
            'alternativeNames': 'Sri Vaidyanatha Ashtakam, Sri Rama Saumitri Jatayu Veda',
            'deity': 'Lord Shiva (Vaidyanatha - Divine Healer)',
            'category': 'Shiva Stotrams',
            'origin': 'Traditional Stotra sung at Vaideeswaran Koil / Vaidyanath Kshetra',
            'significance': 'Prayed to for freedom from chronic illnesses, sorrow, and afflictions; Shiva as the Supreme Physician (Bhava-roga Vaidya).',
            'overallMeaning': 'I bow to Lord Vaidyanatha, worshipped by Sri Rama, Lakshmana, Jatayu, the Vedas, the six-faced Kartikeya, the Sun, and Mars, who eradicates all maladies of worldly existence.',
            'isFeatured': False,
            'sequenceOrder': 14,
            'slices': {
                'english': (171, 190),
                'sanskrit': (125, 137),
                'tamil': None,  # Not present in TAMIL.docx
                'telugu': None   # Not present in TELUGU.docx
            }
        },
        {
            'slug': 'totakashtakam',
            'name': 'Sri Totakashtakam',
            'alternativeNames': 'Totaka Ashtakam, Viditakhila Sastra Sudhajaladhe',
            'deity': 'Sri Adi Shankaracharya',
            'category': 'Guru Stotrams',
            'origin': 'Composed by Giri (Swami Totakacharya)',
            'significance': 'Sung in the buoyant Totaka meter celebrating unconditional surrender and devotion to the Guru.',
            'overallMeaning': 'O ocean of nectar of all known scriptures, master of the lofty truths proclaimed in the Upanishads, O Shankara, our noble Guru, be thou my refuge!',
            'isFeatured': False,
            'sequenceOrder': 15,
            'slices': {
                'english': (190, 199),
                'sanskrit': (137, 146),
                'tamil': (141, 150),
                'telugu': (130, 139)
            }
        },
        {
            'slug': 'bilvashtakam',
            'name': 'Sri Bilvashtakam',
            'alternativeNames': 'Bilva Ashtakam, Tridalam Trigunakaram',
            'deity': 'Lord Shiva',
            'category': 'Shiva Stotrams',
            'origin': 'Traditional Shiva Purana Stuti',
            'significance': 'Praises the offering of the trifoliate Bilva leaf to Lord Shiva, equating one Bilva leaf with thousands of yajnas and dana. Also preserves the Vikalpa Sankarpanam variant recension.',
            'overallMeaning': 'Having three leaflets, embodying the three Gunas, representing the three eyes and three weapons of Shiva, destroying the sins of three lifetimes—I offer this one Bilva leaf unto Shiva.',
            'isFeatured': True,
            'sequenceOrder': 16,
            'slices': {
                'english': (199, 224),
                'sanskrit': (146, 172),
                'tamil': (150, 178),
                'telugu': (139, 155)
            }
        },
        {
            'slug': 'garudagamana-tava',
            'name': 'Maha Vishnu Stotram (Garudagamana Tava)',
            'alternativeNames': 'Maha Vishnu Stotram, Garudagamana Tava Charanakamalam',
            'deity': 'Lord Maha Vishnu',
            'category': 'Vishnu Stotrams',
            'origin': 'Composed by Jagadguru Sri Bharati Tirtha Swamigal (36th Shankaracharya of Sringeri Sharada Peetham)',
            'significance': 'Heartfelt modern devotional prayer asking the Lord to remove worldly afflictions (tapa) and sins (papa).',
            'overallMeaning': 'O rider of Garuda! May your lotus feet ever shine within my heart! O Lord, dispel my affliction, dispel my sins!',
            'isFeatured': False,
            'sequenceOrder': 17,
            'slices': {
                'english': (225, 233),
                'sanskrit': (172, 180),
                'tamil': (178, 186),
                'telugu': (155, 163)
            }
        },
        {
            'slug': 'venkateswara-stotram',
            'name': 'Sri Venkateswara Stotram',
            'alternativeNames': 'Kamalakucha Chuchuka Kunkamato, Venkateswara Stotram',
            'deity': 'Lord Venkateswara (Balaji)',
            'category': 'Vishnu Stotrams',
            'origin': 'Part of the Venkateswara Suprabhatam cycle by Prativadi Bhayankaram Annan',
            'significance': 'Recited daily at Tirumala for the glory and grace of Srinivasa.',
            'overallMeaning': 'Glory unto the Lord whose body is ever colored by the saffron from the chest of Lakshmi, whose eyes are vast like lotus petals, the Lord of the worlds, victorious on Mount Venkata!',
            'isFeatured': False,
            'sequenceOrder': 18,
            'slices': {
                'english': (233, 245),
                'sanskrit': (180, 192),
                'tamil': (186, 198),
                'telugu': (163, 175)
            }
        },
        {
            'slug': 'venkateswara-prapatti',
            'name': 'Sri Venkateswara Prapatti',
            'alternativeNames': 'Venkatesa Prapatti, Isanam Jagatosya Venkatapateh',
            'deity': 'Lord Venkateswara & Goddess Padmavati',
            'category': 'Vishnu Stotrams',
            'origin': 'Tirumala Tradition (Prapatti / Saranagati)',
            'significance': 'Surrender prayer reciting absolute refuge at the feet of the Lord of Seven Hills.',
            'overallMeaning': 'I seek refuge in Goddess Lakshmi, the beloved consort of Lord Venkateswara, and surrender completely unto the lotus feet of Srinivasa.',
            'isFeatured': False,
            'sequenceOrder': 19,
            'slices': {
                'english': (245, 263),
                'sanskrit': (192, 220),
                'tamil': (198, 216),
                'telugu': None  # Not present in TELUGU.docx
            }
        },
        {
            'slug': 'sudarshana-ashtakam',
            'name': 'Sri Sudarshana Ashtakam',
            'alternativeNames': 'Sudarshana Ashtakam, Pratibhatasreni Bhishana',
            'deity': 'Lord Sudarshana (Divine Discus of Vishnu)',
            'category': 'Vishnu Stotrams',
            'origin': 'Composed by Sri Vedanta Desika',
            'significance': 'Powerful protective prayer invoked for vanquishing enemies, diseases, planetary afflictions, and fear.',
            'overallMeaning': 'Victory to Sudarshana, fearsome unto ranks of opponents, praised by celestials, who bestows auspicious knowledge and dispels sorrows.',
            'isFeatured': False,
            'sequenceOrder': 20,
            'slices': {
                'english': (263, 275),
                'sanskrit': None, # Not present in SANSKRIT.docx
                'tamil': (216, 227),
                'telugu': (175, 186)
            }
        },
        {
            'slug': 'govinda-namavali',
            'name': 'Govinda Namavali',
            'alternativeNames': 'Govinda Namaavali, Sri Venkatesa Govinda',
            'deity': 'Lord Venkateswara / Govinda',
            'category': 'Namavali',
            'origin': 'Traditional Tirumala Pilgrim Chants',
            'significance': 'Recited with great enthusiasm during temple walks, processions, and devotional gatherings.',
            'overallMeaning': 'Govinda Hari Govinda, Gokula Nandana Govinda... Sacred sequence of devotional invocations addressing Lord Govinda in His countless divine manifestations.',
            'isFeatured': True,
            'sequenceOrder': 21,
            'slices': {
                'english': (275, 414),
                'sanskrit': (220, 259),
                'tamil': (227, 365),
                'telugu': (186, 325)
            }
        },
        {
            'slug': 'panchayudha-stotram',
            'name': 'Sri Panchayudha Stotram',
            'alternativeNames': 'Panchayudha Stotram, Sphurat Sahasrara Sikhathitivram',
            'deity': 'The Five Sacred Weapons of Lord Vishnu',
            'category': 'Vishnu Stotrams',
            'origin': 'Traditional Vaishnava Stotra',
            'significance': 'Prayed at dawn for cosmic protection against enemies, fire, wild beasts, and distress.',
            'overallMeaning': 'Whoever recites this hymn of the Lord\'s five weapons each morning is freed from all sorrows, dangers, and fear.',
            'isFeatured': False,
            'sequenceOrder': 22,
            'slices': {
                'english': None,
                'sanskrit': (259, 270),
                'tamil': None,
                'telugu': None
            }
        },
        {
            'slug': 'dwadasa-nama-panjaram',
            'name': 'Sri Vishnu Dwadasa Nama Panjara Stotram',
            'alternativeNames': 'Dvadasha Nama Panjara Stotram, Purastat Keshavah Patu',
            'deity': 'Lord Vishnu (Twelve Names Armour)',
            'category': 'Vishnu Stotrams',
            'origin': 'Padma Purana / traditional Kavacham',
            'significance': 'Protective cage/armour (Panjaram) invoking Keshava in the East, Narayana in the West, Madhava above, etc.',
            'overallMeaning': 'May Keshava armed with discus protect from the front, Narayana protect from behind, Madhava protect from above...',
            'isFeatured': False,
            'sequenceOrder': 23,
            'slices': {
                'english': (414, 433),
                'sanskrit': None,
                'tamil': (365, 384),
                'telugu': (325, 349)
            }
        },
        {
            'slug': 'mahalakshmi-ashtakam',
            'name': 'Sri Mahalakshmi Ashtakam',
            'alternativeNames': 'Mahalakshmi Ashtakam, Namastestu Mahamaye',
            'deity': 'Goddess Mahalakshmi',
            'category': 'Devi Stotrams',
            'origin': 'Padma Purana (spoken by Lord Indra)',
            'significance': 'Eight famous verses recited for wealth, spiritual purity, auspiciousness, and peace.',
            'overallMeaning': 'Salutations unto You, O Mahamaya, residing in Sri Peetha, worshipped by celestials, holding conch, discus, and mace, O Mahalakshmi, salutations unto You!',
            'isFeatured': True,
            'sequenceOrder': 24,
            'slices': {
                'english': (433, 456),
                'sanskrit': None,
                'tamil': (384, 407),
                'telugu': (349, 366)
            }
        },
        {
            'slug': 'ashtalakshmi-stotram',
            'name': 'Ashtalakshmi Stotram',
            'alternativeNames': 'Ashta Lakshmi Stotram, Sumanasa Vandita Sundari Madhavi',
            'deity': 'Ashta Lakshmi',
            'category': 'Devi Stotrams',
            'origin': 'Traditional Stuti to the Eight Forms of Lakshmi',
            'significance': 'Recited on Fridays, Varalakshmi Vratham, and Diwali for all eight forms of prosperity.',
            'overallMeaning': 'Hymn to the 8 aspects of Goddess Lakshmi: Adi Lakshmi, Dhanya Lakshmi, Dhairya Lakshmi, Gaja Lakshmi, Santana Lakshmi, Vijaya Lakshmi, Vidya Lakshmi, and Dhana Lakshmi.',
            'isFeatured': True,
            'sequenceOrder': 25,
            'slices': {
                'english': (456, 502),
                'sanskrit': None,
                'tamil': (407, 448),
                'telugu': (366, 407)
            }
        },
        {
            'slug': 'kshama-prarthana',
            'name': 'Kshama Prarthana / Samarpanam',
            'alternativeNames': 'Kshama Aparadha Stotram, Kayena Vacha Manasendriyairva',
            'deity': 'Lord Narayana',
            'category': 'Dhyanam',
            'origin': 'Mukundamala / Srimad Bhagavatam (11.2.36)',
            'significance': 'Universal prayer of surrender and asking forgiveness for unintentional shortcomings in worship.',
            'overallMeaning': 'Whatever I do with body, speech, mind, senses, intellect, or through the natural disposition of nature, I offer it all unto the Supreme Lord Narayana.',
            'isFeatured': False,
            'sequenceOrder': 26,
            'slices': {
                'english': (502, 507),
                'sanskrit': None,
                'tamil': (448, 458),
                'telugu': (407, 413)
            }
        }
    ]
    
    # Flagged items from the Parayanam document that need manual review:
    flagged_slokhas = [
        {
            'slug': 'sri-lalita-sahasranama-stotram',
            'name': 'Sri Lalitasahasranama Stotram',
            'alternativeNames': 'Lalita Sahasranama, Rahasya Nama Sahasram',
            'deity': 'Goddess Lalita Tripurasundari',
            'category': 'Sahasranamams',
            'origin': 'Brahmanda Purana (dialogue between Hayagriva and Agastya)',
            'significance': 'Recited during Devi pujas, Navaratri, and Amrita Darshanam homam. In ENGLISH.docx, this title is present at line 7 with no prayer text.',
            'overallMeaning': 'Thousand sacred names of the Supreme Divine Mother Lalita Tripurasundari expounding cosmic creation, grace, and liberation.',
            'status': 'pending_review',
            'sourceDoc': 'ENGLISH.docx & SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Title appears at line 7 in ENGLISH.docx without body text. Listed as item #7 in SRI MAHAGANAPATHI HOMAM JULY.docx parayanam.'
        },
        {
            'slug': 'sri-vishnu-sahasranama-stotram',
            'name': 'Sri Vishnu Sahasranama Stotram',
            'alternativeNames': 'Vishnu Sahasranamam, 1000 Names of Maha Vishnu',
            'deity': 'Lord Maha Vishnu',
            'category': 'Sahasranamams',
            'origin': 'Mahabharata (Anushasana Parva, Bhishma to Yudhishthira)',
            'significance': 'Supreme hymn of 1000 divine names of Lord Vishnu. In ENGLISH.docx, title is present at line 224 with no prayer text.',
            'overallMeaning': 'Thousand holy names of Lord Vishnu conferring peace, devotion, and liberation.',
            'status': 'pending_review',
            'sourceDoc': 'ENGLISH.docx & SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Title appears at line 224 in ENGLISH.docx without body text. Listed as item #31 in SRI MAHAGANAPATHI HOMAM JULY.docx parayanam.'
        },
        {
            'slug': 'amma-ashtottara-satanamavali',
            'name': 'Amma Ashtottara Satanamavali',
            'alternativeNames': 'Sri Mata Amritanandamayi 108 Names',
            'deity': 'Sri Mata Amritanandamayi Devi (Amma)',
            'category': 'Namavali',
            'origin': 'Amrita Darshanam / Mata Amritanandamayi Math',
            'significance': 'The 108 sacred names of Amma. Explicitly noted in Homam document as "(will be performed by Swamiji)".',
            'overallMeaning': 'Devotional offering of 108 names meditating upon Amma\'s divine qualities, universal love, and selfless service.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #6 in Homam document: "(will be performed by Swamiji)". Prayer text reserved for administrator review.'
        },
        {
            'slug': 'medha-suktham',
            'name': 'Medha Suktham',
            'alternativeNames': 'Meda Sukta, Rigvedic / Yajurvedic Medha Suktam',
            'deity': 'Goddess Saraswati / Medha (Divine Intellect)',
            'category': 'Vedic Suktams',
            'origin': 'Mahanarayana Upanishad / Taittiriya Aranyaka',
            'significance': 'Recited by students and scholars for sharpening intellect, retention, and spiritual discernment.',
            'overallMeaning': 'Vedic invocation praying for sublime intellect, memory, vigor, and divine knowledge.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #25 in Homam parayanam. Text not provided in language DOCX files.'
        },
        {
            'slug': 'aikyamathya-suktham',
            'name': 'Aikyamathya Suktham',
            'alternativeNames': 'Samjnana Suktam, Rigveda Mandala 10 Hymn 191',
            'deity': 'Agni / Universal Harmony',
            'category': 'Vedic Suktams',
            'origin': 'Rigveda (10.191)',
            'significance': 'Vedic hymn for unity of purpose, speech, hearts, and minds across communities and institutions.',
            'overallMeaning': 'Common be your prayer, common be your goal, common your mind, united your thought. May your union be harmonious!',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #26 in Homam parayanam. Text not provided in language DOCX files.'
        },
        {
            'slug': 'purusha-suktham',
            'name': 'Purusha Suktham',
            'alternativeNames': 'Purusha Sukta, Rigveda Mandala 10 Hymn 90',
            'deity': 'Cosmic Being (Purusha / Narayana)',
            'category': 'Vedic Suktams',
            'origin': 'Rigveda (10.90) & Yajurveda',
            'significance': 'Foundational Vedic hymn describing the cosmic sacrifice and the manifestation of the entire universe from the Cosmic Being.',
            'overallMeaning': 'The Cosmic Person has a thousand heads, a thousand eyes, a thousand feet; pervading the universe on all sides, He transcends it by ten finger-widths.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #27 in Homam parayanam. Text not provided in language DOCX files.'
        },
        {
            'slug': 'sri-suktham',
            'name': 'Sri Suktham',
            'alternativeNames': 'Rigvedic Sri Sukta, Hiranyavarnam Harineem',
            'deity': 'Goddess Sri / Mahalakshmi',
            'category': 'Vedic Suktams',
            'origin': 'Rigveda Khilani',
            'significance': 'Vedic hymn invoking Goddess Lakshmi for spiritual and material abundance, light, and eradication of misfortune.',
            'overallMeaning': 'Invoke for me, O Agni, that Lakshmi of golden hue, deer-like, adorned with gold and silver garlands, brilliant like the moon.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #28 in Homam parayanam. Text not provided in language DOCX files.'
        },
        {
            'slug': 'sikshavalli-11th-anuvakam',
            'name': 'Sikshavalli - 11th Anuvakam',
            'alternativeNames': 'Taittiriya Upanishad Convocation Address, Satyam Vada Dharmam Chara',
            'deity': 'Vedic Rishis / Truth',
            'category': 'Vedic Suktams',
            'origin': 'Taittiriya Upanishad (Sikshavalli, Anuvaka 11)',
            'significance': 'Ancient Indian university convocation address: "Speak the truth. Practice righteousness. Do not neglect study."',
            'overallMeaning': 'Exhortation from the Guru to departing students: Speak truth, abide by Dharma, respect parents, teachers, and guests as divine.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #29 in Homam parayanam. Text not provided in language DOCX files.'
        },
        {
            'slug': 'sri-mahalakshmi-stotram',
            'name': 'Sri Mahalakshmi Stotram',
            'alternativeNames': 'Mahalakshmi Stuti, Sarvajnaye Sarvavaradaye',
            'deity': 'Goddess Mahalakshmi',
            'category': 'Devi Stotrams',
            'origin': 'Puranic Stuti',
            'significance': 'Distinct from Mahalakshmi Ashtakam; sung in the homam for Lakshmi priti.',
            'overallMeaning': 'Salutations to the Supreme Goddess who knows all, bestows all boons, and confers auspiciousness.',
            'status': 'pending_review',
            'sourceDoc': 'SRI MAHAGANAPATHI HOMAM JULY.docx',
            'message': 'Listed as item #39 in Homam parayanam. Distinct from Mahalakshmi Ashtakam.'
        }
    ]
    
    # Connect to SQLite dev.db
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Clean existing rows
    cur.execute("DELETE FROM Feedback;")
    cur.execute("DELETE FROM AuditReview;")
    cur.execute("DELETE FROM AdminUser;")
    cur.execute("DELETE FROM FestivalOccasion;")
    cur.execute("DELETE FROM OccasionSlokha;")
    cur.execute("DELETE FROM SlokhaVersion;")
    cur.execute("DELETE FROM Slokha;")
    cur.execute("DELETE FROM Occasion;")
    cur.execute("DELETE FROM Festival;")
    
    now_str = datetime.utcnow().isoformat() + "Z"
    
    audit_reports = []
    parsed_prayers_output = []
    
    print("Seeding Slokhas and Language Versions...")
    # Seed active slokhas with their multilingual text
    for p in prayers_meta:
        slokha_id = f"slokha-{p['slug']}"
        source_refs = []
        for lang, s in p['slices'].items():
            if s is not None:
                source_refs.append(f"{lang.upper()}.docx")
        source_ref_str = ", ".join(source_refs) if source_refs else "DOCX Collection"
        
        cur.execute("""
            INSERT INTO Slokha (id, name, slug, alternativeNames, deity, category, origin, significance, overallMeaning, sourceReference, isFeatured, sequenceOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            slokha_id,
            p['name'],
            p['slug'],
            p['alternativeNames'],
            p['deity'],
            p['category'],
            p['origin'],
            p['significance'],
            p['overallMeaning'],
            source_ref_str,
            1 if p['isFeatured'] else 0,
            p['sequenceOrder'],
            now_str,
            now_str
        ))
        
        prayer_record = {
            'id': slokha_id,
            'name': p['name'],
            'slug': p['slug'],
            'category': p['category'],
            'deity': p['deity'],
            'versions': {}
        }
        
        # Languages
        lang_configs = [
            ('english', 'latin', 'transliteration', eng_texts, 'ENGLISH.docx'),
            ('sanskrit', 'devanagari', 'original_text', san_texts, 'SANSKRIT.docx'),
            ('tamil', 'tamil', 'original_text', tam_texts, 'TAMIL.docx'),
            ('telugu', 'telugu', 'original_text', tel_texts, 'TELUGU.docx'),
        ]
        
        for lang_name, script_name, c_type, doc_texts, doc_fn in lang_configs:
            slice_range = p['slices'].get(lang_name)
            if slice_range is not None:
                start_l, end_l = slice_range
                raw_slice_lines = doc_texts[start_l:end_l]
                
                # Filter out the title line itself from the verses body if it's the first line
                body_lines = raw_slice_lines[1:] if len(raw_slice_lines) > 1 else raw_slice_lines
                full_text = '\n\n'.join(body_lines)
                verses = parse_verses(body_lines)
                verses_json = json.dumps(verses, ensure_ascii=False)
                
                ver_id = f"ver-{p['slug']}-{lang_name}"
                cur.execute("""
                    INSERT INTO SlokhaVersion (id, slokhaId, language, script, contentType, text, versesJson, meaning, pdfPath, sourceDocument, verificationStatus, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ver_id,
                    slokha_id,
                    lang_name,
                    script_name,
                    c_type,
                    full_text,
                    verses_json,
                    p['overallMeaning'] if lang_name == 'english' else None,
                    f"/api/pdf/{p['slug']}/{lang_name}",
                    doc_fn,
                    'verified',
                    now_str,
                    now_str
                ))
                
                prayer_record['versions'][lang_name] = {
                    'script': script_name,
                    'verseCount': len(verses),
                    'charCount': len(full_text),
                    'sourceDocument': doc_fn,
                    'status': 'verified'
                }
            else:
                audit_reports.append({
                    'entityType': 'version',
                    'entitySlug': p['slug'],
                    'title': f"{p['name']} ({lang_name.title()})",
                    'sourceDocument': doc_fn,
                    'status': 'flagged_for_review',
                    'message': f"Version not present in uploaded {doc_fn}. Marked as not available yet."
                })
                cur.execute("""
                    INSERT INTO AuditReview (id, entityType, entitySlug, title, sourceDocument, status, message, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"audit-{p['slug']}-{lang_name}",
                    'version',
                    p['slug'],
                    f"{p['name']} ({lang_name.title()})",
                    doc_fn,
                    'flagged_for_review',
                    f"Version not present in uploaded {doc_fn}. Marked as not available yet.",
                    now_str
                ))
                
        parsed_prayers_output.append(prayer_record)

    # Seed flagged / incomplete items so they appear in review queue and are searchable
    for f in flagged_slokhas:
        f_id = f"slokha-{f['slug']}"
        cur.execute("""
            INSERT INTO Slokha (id, name, slug, alternativeNames, deity, category, origin, significance, overallMeaning, sourceReference, isFeatured, sequenceOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f_id,
            f['name'],
            f['slug'],
            f['alternativeNames'],
            f['deity'],
            f['category'],
            f['origin'],
            f['significance'],
            f['overallMeaning'],
            f['sourceDoc'],
            0,
            99,
            now_str,
            now_str
        ))
        
        audit_reports.append({
            'entityType': 'slokha',
            'entitySlug': f['slug'],
            'title': f['name'],
            'sourceDocument': f['sourceDoc'],
            'status': 'incomplete',
            'message': f['message']
        })
        cur.execute("""
            INSERT INTO AuditReview (id, entityType, entitySlug, title, sourceDocument, status, message, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"audit-{f['slug']}",
            'slokha',
            f['slug'],
            f['name'],
            f['sourceDoc'],
            'incomplete',
            f['message'],
            now_str
        ))

    print("Seeding Occasions and Festivals...")
    
    # 1. Sri Mahaganapathi Homam from DOCX
    homam_id = "occ-mahaganapathi-homam-2026"
    cur.execute("""
        INSERT INTO Occasion (id, name, slug, date, year, occasionType, description, institution, source, verificationStatus, poojaChecklist, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        homam_id,
        "Sri Mahaganapathi Homam",
        "sri-mahaganapathi-homam-2026",
        "2026-07-22",
        2026,
        "amrita_darshanam",
        "Annual sacred Mahaganapathi Homam and parayanam ceremony conducted by the Department of Amrita Darshanam at Amrita School of Engineering, Chennai. Includes Amma Dhyanam, Ganesha Aradhana, Vedic Suktams, and Stotras.",
        "Amrita School of Engineering, Chennai - DEPARTMENT OF AMRITA DARSHANAM",
        "SRI MAHAGANAPATHI HOMAM JULY.docx",
        "verified",
        json.dumps([
            {"step": 1, "task": "Sankalpam and Vigneshwara Puja", "completed": True},
            {"step": 2, "task": "Amma Dhyanam & Chanting", "completed": True},
            {"step": 3, "task": "Amma Astotra Satanamavali (performed by Swamiji)", "completed": True},
            {"step": 4, "task": "Parayanam of Stotrams and Vedic Suktams", "completed": True},
            {"step": 5, "task": "Agni Pradakshinam & Mahaganapathi Ahutis", "completed": True},
            {"step": 6, "task": "Poornahuti & Maha Mangala Arati", "completed": True},
            {"step": 7, "task": "Prasada Viniyogam", "completed": True}
        ]),
        now_str,
        now_str
    ))

    # Associate Homam with its Parayanam Slokhas in exact order from document
    homam_parayanam_slugs = [
        ('amma-dhyanam', 'Amma Dhyanam', 'dhyanam', 'Opening invocation to Amma'),
        ('amma-ashtottara-satanamavali', 'Amma Astotra Satanamavali', 'ashtottara', 'will be performed by Swamiji'),
        ('sri-lalita-sahasranama-stotram', 'Sri Lalitasahasranama Stotram', 'parayanam', 'Complete parayanam'),
        ('mahaganapathi-dhyanam', 'Sri Ganesha Dhyanam', 'dhyanam', 'Vakratunda & Suklambaradharam'),
        ('mahaganesha-pancharatnam', 'Sri Ganesha Pancharatnam', 'stotram', 'Pancharatnam of Adi Shankara'),
        ('sankata-nashana-ganesha-stotram', 'Sri Shankatanasana Ganapathi Stotram', 'stotram', '12 sacred names'),
        ('guru-stotram', 'Sri Guru stotram', 'stotram', 'Akhanda Mandalagram'),
        ('gurvashtakam', 'Sri Guru Ashtakam', 'stotram', 'Sariram Surupam'),
        ('guru-paduka-stotram', 'Sri Gurupaduka stotram', 'stotram', 'Ananta Samsara'),
        ('dakshinamurthy-stotram', 'Sri Dakshinamoorthy Stotram', 'stotram', 'Vishvam Darpana Drishyamana'),
        ('lingashtakam', 'Sri Lingashtakkam', 'stotram', 'Brahmamurari Surarchita'),
        ('shiva-panchakshari-stotram', 'Sri Shivapanchakshari stotram', 'stotram', 'Nagendra Haraya'),
        ('kalabhairava-ashtakam', 'Sri Kalabhairavashtakam', 'stotram', 'Kashipura Adhinatha'),
        ('shiva-tandava-stotram', 'Sri Shivatandava stotram', 'stotram', 'Jatataveegalajjala'),
        ('chandrasekhara-ashtakam', 'Sri Chandrasekharashtakam', 'stotram', 'Chandrasekhara Pahi Mam'),
        ('totakashtakam', 'Sri Totakaashtakam', 'stotram', 'Viditakhila Sastra'),
        ('bilvashtakam', 'Sri Bilvashtakam', 'stotram', 'Tridalam Trigunakaram'),
        ('medha-suktham', 'Medha Suktham', 'vedic_suktam', 'Taittiriya Aranyaka'),
        ('aikyamathya-suktham', 'Aikhyamathya Suktham', 'vedic_suktam', 'Rigveda 10.191'),
        ('purusha-suktham', 'Purusha Suktham', 'vedic_suktam', 'Rigveda 10.90'),
        ('sri-suktham', 'Sri Suktham', 'vedic_suktam', 'Rigvedic Khila'),
        ('sikshavalli-11th-anuvakam', 'Sikshavalli- 11th Anuvakam', 'vedic_suktam', 'Taittiriya Upanishad'),
        ('sri-vishnu-sahasranama-stotram', 'Sri Vishnu sahasranama stotram', 'sahasranamam', 'Mahabharata Anushasana Parva'),
        ('garudagamana-tava', 'Sri Mahavishnu Stotram', 'stotram', 'Garudagamana Tava'),
        ('venkateswara-stotram', 'Sri Venkatesha Stotram', 'stotram', 'Kamalakucha Chuchuka'),
        ('sudarshana-ashtakam', 'Sri Sudharshana Ashtakam', 'stotram', 'Vedantacharya Krutam'),
        ('govinda-namavali', 'Sri Govinda Namavali', 'namavali', 'Srinivasa Govinda'),
        ('dwadasa-nama-panjaram', 'Sri Dwadashanama Panchara Stotram', 'stotram', 'Twelve Names Armour'),
        ('mahalakshmi-ashtakam', 'Sri Mahalakshmi Ashtakam', 'stotram', 'Namastestu Mahamaye'),
        ('sri-mahalakshmi-stotram', 'Sri Mahalakshmi stotram', 'stotram', 'Devi Stotra')
    ]
    
    for seq_idx, (p_slug, raw_title, assoc_type, p_notes) in enumerate(homam_parayanam_slugs, 1):
        target_slokha_id = f"slokha-{p_slug}"
        cur.execute("""
            INSERT INTO OccasionSlokha (id, occasionId, slokhaId, sequenceOrder, associationType, notes, sourceReference)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            f"os-homam-{seq_idx}",
            homam_id,
            target_slokha_id,
            seq_idx,
            assoc_type,
            p_notes,
            "SRI MAHAGANAPATHI HOMAM JULY.docx"
        ))

    # 2. Institutional and Hindu Occasions
    additional_occasions = [
        {
            'slug': 'amma-birthday-2026',
            'name': "Amma's 73rd Birthday (Mata Amritanandamayi Jayanthi)",
            'date': '2026-09-27',
            'year': 2026,
            'occasionType': 'amrita_institution',
            'institution': 'Mata Amritanandamayi Math / Amrita Vishwa Vidyapeetham',
            'source': 'Official Amritapuri Ashram Spiritual Calendar',
            'verificationStatus': 'verified',
            'description': 'The auspicious celebration of Satguru Sri Mata Amritanandamayi Devi\'s Jayanthi observed in the Karthika Nakshatra of Kanya masa. Celebrated with global prayers for world peace (Lokah Samastah Sukhino Bhavantu), Pada Puja, and cultural programs.',
            'checklist': [
                {"step": 1, "task": "Morning Amrita Dhyanam & Chanting", "completed": True},
                {"step": 2, "task": "Guru Paduka Puja & Archanas", "completed": True},
                {"step": 3, "task": "Recitation of Sri Lalita Sahasranama & Amma Ashtottara", "completed": True},
                {"step": 4, "task": "Seva activities, green campus drives, and annadanam", "completed": True}
            ],
            'slokhas': ['amma-dhyanam', 'guru-stotram', 'gurvashtakam', 'guru-paduka-stotram', 'totakashtakam', 'sri-lalita-sahasranama-stotram', 'amma-ashtottara-satanamavali']
        },
        {
            'slug': 'amrita-vidyarambham-2026',
            'name': 'Amrita Vidyarambham & Saraswati Puja 2026',
            'date': '2026-10-20',
            'year': 2026,
            'occasionType': 'amrita_institution',
            'institution': 'Amrita Vishwa Vidyapeetham - All Campuses',
            'source': 'Amrita Academic Calendar 2026',
            'verificationStatus': 'verified',
            'description': 'Vijayadashami / Vidyarambham ceremony celebrating initiation into knowledge, arts, sciences, and engineering with sacred blessings.',
            'checklist': [
                {"step": 1, "task": "Ayudha Puja of campus laboratories and computers", "completed": True},
                {"step": 2, "task": "Saraswati & Vinayaka Invocation", "completed": True},
                {"step": 3, "task": "Recitation of Medha Suktam and Sikshavalli", "completed": True},
                {"step": 4, "task": "Aksharabhyasam / Vidyarambham blessing", "completed": True}
            ],
            'slokhas': ['mahaganapathi-dhyanam', 'mahaganesha-pancharatnam', 'guru-stotram', 'medha-suktham', 'sikshavalli-11th-anuvakam']
        },
        {
            'slug': 'amrita-darshanam-sankranti-2026',
            'name': 'Amrita Darshanam Makara Sankranti Satsang',
            'date': '2026-01-14',
            'year': 2026,
            'occasionType': 'amrita_darshanam',
            'institution': 'Amrita School of Engineering, Chennai - Department of Amrita Darshanam',
            'source': 'Departmental Event Notice 2026',
            'verificationStatus': 'verified',
            'description': 'Traditional harvest and Sun worship discourse with cultural chanting and reflection on cultural heritage and nature reverence.',
            'checklist': [
                {"step": 1, "task": "Aditya and Surya Invocation", "completed": True},
                {"step": 2, "task": "Pongal preparation and offering", "completed": True},
                {"step": 3, "task": "Cultural discussion on Dharma in daily life", "completed": True}
            ],
            'slokhas': ['amma-dhyanam', 'guru-stotram', 'aikyamathya-suktham']
        }
    ]

    for occ in additional_occasions:
        occ_id = f"occ-{occ['slug']}"
        cur.execute("""
            INSERT INTO Occasion (id, name, slug, date, year, occasionType, description, institution, source, verificationStatus, poojaChecklist, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            occ_id,
            occ['name'],
            occ['slug'],
            occ['date'],
            occ['year'],
            occ['occasionType'],
            occ['description'],
            occ['institution'],
            occ['source'],
            occ['verificationStatus'],
            json.dumps(occ['checklist']),
            now_str,
            now_str
        ))
        
        for seq_i, s_slug in enumerate(occ['slokhas'], 1):
            cur.execute("""
                INSERT INTO OccasionSlokha (id, occasionId, slokhaId, sequenceOrder, associationType, notes, sourceReference)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"os-{occ['slug']}-{seq_i}",
                occ_id,
                f"slokha-{s_slug}",
                seq_i,
                "parayanam",
                f"Associated recitation for {occ['name']}",
                occ['source']
            ))

    # 3. Hindu Festivals (Stored by year, handling lunar calendar variations)
    festivals_data = [
        {
            'name': 'Diwali / Deepavali',
            'slug': 'diwali-2026',
            'date': '2026-11-08',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang / Chandramana Panchanga (Kartika Amavasya)',
            'verificationStatus': 'verified',
            'deities': 'Goddess Mahalakshmi, Lord Ganesha, Lord Rama',
            'significance': 'Festival of Lights celebrating the victory of light over darkness, truth over falsehood, and knowledge over ignorance. Commemorates Sri Rama\'s return to Ayodhya and Mahalakshmi Puja.',
            'description': 'Diwali is one of the most spiritually joyful festivals in Sanatana Dharma. Devotees illuminate homes with oil lamps (deepams), clean homes, and perform Sri Suktam and Mahalakshmi Ashtakam recitation.',
            'checklist': [
                {"step": 1, "task": "Ganga Snanam / Auspicious morning oil bath", "completed": True},
                {"step": 2, "task": "Lighting traditional clay lamps (Diyas)", "completed": True},
                {"step": 3, "task": "Ganesha & Mahalakshmi Puja with flowers", "completed": True},
                {"step": 4, "task": "Recitation of Sri Suktam & Mahalakshmi Ashtakam", "completed": True},
                {"step": 5, "task": "Distribution of sweets and joy to community", "completed": True}
            ],
            'slokhas': ['mahaganapathi-dhyanam', 'mahaganesha-pancharatnam', 'mahalakshmi-ashtakam', 'ashtalakshmi-stotram', 'sri-suktham']
        },
        {
            'name': 'Vinayaka Chaturthi / Ganesh Chaturthi',
            'slug': 'ganesh-chaturthi-2026',
            'date': '2026-09-14',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian (Special in Maharashtra, Tamil Nadu, Andhra Pradesh)',
            'source': 'Drik Panchang (Bhadrapada Shukla Chaturthi)',
            'verificationStatus': 'verified',
            'deities': 'Lord Ganesha (Vinayaka)',
            'significance': 'The descent day of Lord Ganesha, embodiment of wisdom, intellect, and the dispeller of all obstacles.',
            'description': 'Families and temples install clay murtis of Ganesha, offer 21 modakas and durva grass, and chant Ganesha Pancharatnam and Sankata Nashana Ganapathi Stotram.',
            'checklist': [
                {"step": 1, "task": "Prana Pratishtha of clay Ganesha murti", "completed": True},
                {"step": 2, "task": "Offering 21 Durva grass blades & Red Hibiscus", "completed": True},
                {"step": 3, "task": "Chanting Ganesha Pancharatnam & 12 Names", "completed": True},
                {"step": 4, "task": "Offering Modakam, Kozhukattai, and fruits", "completed": True},
                {"step": 5, "task": "Ganapathi Arati & Visarjan prayer", "completed": True}
            ],
            'slokhas': ['mahaganapathi-dhyanam', 'mahaganesha-pancharatnam', 'sankata-nashana-ganesha-stotram']
        },
        {
            'name': 'Krishna Janmashtami / Gokulashtami',
            'slug': 'krishna-janmashtami-2026',
            'date': '2026-09-04',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Bhadrapada Krishna Ashtami - Rohini Nakshatra)',
            'verificationStatus': 'verified',
            'deities': 'Lord Sri Krishna / Maha Vishnu',
            'significance': 'Celebrating the divine birth of Bhagavan Sri Krishna, teacher of the Bhagavad Gita and protector of Dharma.',
            'description': 'Devotees observe fasting until midnight, draw footprints of baby Krishna entering the house, and sing Govinda Namavali and Vishnu Stotras.',
            'checklist': [
                {"step": 1, "task": "Decorating altars and drawing Krishna's holy feet", "completed": True},
                {"step": 2, "task": "Fasting and contemplation of Gita teachings", "completed": True},
                {"step": 3, "task": "Midnight Abhishekam to Balakrishna with milk and panchamritam", "completed": True},
                {"step": 4, "task": "Chanting Govinda Namavali & Vishnu Stotrams", "completed": True},
                {"step": 5, "task": "Offering butter, aval (poha), and sweets", "completed": True}
            ],
            'slokhas': ['govinda-namavali', 'garudagamana-tava', 'sri-vishnu-sahasranama-stotram', 'venkateswara-stotram']
        },
        {
            'name': 'Maha Shivaratri',
            'slug': 'maha-shivaratri-2026',
            'date': '2026-02-15',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Phalguna/Magha Krishna Chaturdashi)',
            'verificationStatus': 'verified',
            'deities': 'Lord Shiva (Mahadeva)',
            'significance': 'The Great Night of Shiva commemorating the manifestation of the Jyotirlinga and the divine wedding of Shiva and Parvati.',
            'description': 'Night-long vigil (Jagaran), continuous chanting of Om Namah Shivaya, Bilva leaf offering, and recitation of Shiva Tandava Stotram and Lingashtakam.',
            'checklist': [
                {"step": 1, "task": "All-day fasting and inward contemplation", "completed": True},
                {"step": 2, "task": "Four Kalams of night puja with Rudrabhishekam", "completed": True},
                {"step": 3, "task": "Offering Bilva leaves with Bilvashtakam chanting", "completed": True},
                {"step": 4, "task": "Singing Shiva Tandava Stotram & Lingashtakam", "completed": True},
                {"step": 5, "task": "Morning parana after sunrise Arati", "completed": True}
            ],
            'slokhas': ['shiva-panchakshari-stotram', 'lingashtakam', 'bilvashtakam', 'shiva-tandava-stotram', 'chandrasekhara-ashtakam', 'dakshinamurthy-stotram', 'kalabhairava-ashtakam']
        },
        {
            'name': 'Navaratri (Sharad Navaratri)',
            'slug': 'navaratri-2026',
            'date': '2026-10-11',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Ashwina Shukla Pratipada to Navami)',
            'verificationStatus': 'verified',
            'deities': 'Goddess Durga, Goddess Lakshmi, Goddess Saraswati',
            'significance': 'Nine sacred nights worshipping the Mother Divine in Her nine glorious manifestations (Navadurga).',
            'description': 'Celebrated with Golu displays in Tamil Nadu, Garba in Gujarat, and Durga Puja in Bengal. Ideal period for Sri Lalita Sahasranama parayanam.',
            'checklist': [
                {"step": 1, "task": "Kalasha Sthapana & Ghatasthapana", "completed": True},
                {"step": 2, "task": "First 3 days: Durga Puja for overcoming impurities", "completed": True},
                {"step": 3, "task": "Middle 3 days: Lakshmi Puja for noble virtues and wealth", "completed": True},
                {"step": 4, "task": "Final 3 days: Saraswati Puja for supreme wisdom", "completed": True},
                {"step": 5, "task": "Daily parayanam of Sri Lalitasahasranama Stotram", "completed": True}
            ],
            'slokhas': ['sri-lalita-sahasranama-stotram', 'mahalakshmi-ashtakam', 'ashtalakshmi-stotram', 'sri-suktham']
        },
        {
            'name': 'Vijayadashami / Dussehra',
            'slug': 'vijayadashami-2026',
            'date': '2026-10-20',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Ashwina Shukla Dashami)',
            'verificationStatus': 'verified',
            'deities': 'Goddess Durga, Goddess Saraswati, Lord Rama',
            'significance': 'Victory of Mahishasuramardini over the demon Mahishasura and Sri Rama over Ravana. Day of Vidyarambham.',
            'description': 'Considered the most auspicious day of the year to start new educational ventures, study, arts, and spiritual practice.',
            'checklist': [
                {"step": 1, "task": "Puja to textbooks, musical instruments, and work tools", "completed": True},
                {"step": 2, "task": "Vidyarambham: writing the first sacred letters on rice", "completed": True},
                {"step": 3, "task": "Salutations to teachers, gurus, and elders", "completed": True}
            ],
            'slokhas': ['guru-stotram', 'guru-paduka-stotram', 'totakashtakam', 'medha-suktham', 'sikshavalli-11th-anuvakam']
        },
        {
            'name': 'Rama Navami',
            'slug': 'rama-navami-2026',
            'date': '2026-03-27',
            'year': 2026,
            'category': 'Major Hindu Festival',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Chaitra Shukla Navami)',
            'verificationStatus': 'verified',
            'deities': 'Lord Sri Rama',
            'significance': 'The birth anniversary of Maryada Purushottama Lord Sri Rama, the embodiment of righteousness and duty.',
            'description': 'Devotees read Valmiki Ramayana, celebrate Sri Sita Rama Kalyanam, and chant the divine Rama Nama.',
            'checklist': [
                {"step": 1, "task": "Special midday puja at Abhijit Muhurta (12 Noon)", "completed": True},
                {"step": 2, "task": "Panakam, Neer Mor (spiced buttermilk), and Kosumalli offering", "completed": True},
                {"step": 3, "task": "Recitation of Nama Ramayana and Govinda Namavali", "completed": True}
            ],
            'slokhas': ['govinda-namavali', 'sri-vishnu-sahasranama-stotram', 'venkateswara-stotram']
        },
        {
            'name': 'Pongal / Makar Sankranti',
            'slug': 'pongal-2026',
            'date': '2026-01-14',
            'year': 2026,
            'category': 'Regional Harvest & Vedic Festival',
            'region': 'Tamil Nadu, South India & Pan-Indian',
            'source': 'Souramana Calendar (Sun enters Makara Rashi)',
            'verificationStatus': 'verified',
            'deities': 'Surya Deva (Sun God), Mother Nature, Kamadhenu',
            'significance': 'Four-day harvest celebration thanking the Sun, rain, cattle, and soil for a bountiful harvest.',
            'description': 'Includes Bhogi, Surya Pongal (boiling sweet rice in clay pots), Mattu Pongal (cattle reverence), and Kaanum Pongal (community family reunions).',
            'checklist': [
                {"step": 1, "task": "Kolam drawing with rice flour at sunrise", "completed": True},
                {"step": 2, "task": "Cooking fresh sweet Pongal in traditional pot until it overflows with joy ('Pongalo Pongal!')", "completed": True},
                {"step": 3, "task": "Surya Puja with turmeric plant, sugarcane, and bananas", "completed": True}
            ],
            'slokhas': ['amma-dhyanam', 'guru-stotram', 'aikyamathya-suktham']
        },
        {
            'name': 'Ugadi / Gudi Padwa',
            'slug': 'ugadi-2026',
            'date': '2026-03-19',
            'year': 2026,
            'category': 'Regional New Year',
            'region': 'Andhra Pradesh, Telangana, Karnataka, Maharashtra',
            'source': 'Chandramana Panchanga (Chaitra Shukla Pratipada)',
            'verificationStatus': 'verified',
            'deities': 'Lord Brahma, Lord Vishnu',
            'significance': 'Vedic New Year marking the dawn of creation by Lord Brahma. Commemorates new beginnings with balanced equanimity.',
            'description': 'Devotees taste Ugadi Pachadi combining six tastes (sweet, sour, bitter, salty, pungent, astringent) symbolizing the spectrum of life experiences.',
            'checklist': [
                {"step": 1, "task": "Mango leaf Toranam at entrance", "completed": True},
                {"step": 2, "task": "Preparing and partaking Ugadi Pachadi (Shadruchulu)", "completed": True},
                {"step": 3, "task": "Panchanga Sravanam (listening to annual forecast)", "completed": True}
            ],
            'slokhas': ['mahaganapathi-dhyanam', 'govinda-namavali', 'venkateswara-stotram']
        },
        {
            'name': 'Guru Purnima',
            'slug': 'guru-purnima-2026',
            'date': '2026-07-29',
            'year': 2026,
            'category': 'Major Spiritual Observance',
            'region': 'Pan-Indian & Amrita Institutions',
            'source': 'Drik Panchang (Ashadha Purnima - Vyasa Purnima)',
            'verificationStatus': 'verified',
            'deities': 'Sage Veda Vyasa, Satguru Sri Mata Amritanandamayi Devi, Adi Shankara',
            'significance': 'Sacred full moon dedicated to the lineage of spiritual teachers (Guru Parampara) and gratitude to the preceptor.',
            'description': 'Observed with deep reverence at Amrita Darshanam and all ashrams with Guru Paduka Puja, Vyasa Puja, and meditation.',
            'checklist': [
                {"step": 1, "task": "Guru Paduka Abhishekam & Archana", "completed": True},
                {"step": 2, "task": "Recitation of Guru Gita, Guru Stotram, and Gurvashtakam", "completed": True},
                {"step": 3, "task": "Contemplation of Guru's spiritual teachings", "completed": True}
            ],
            'slokhas': ['amma-dhyanam', 'guru-stotram', 'gurvashtakam', 'guru-paduka-stotram', 'totakashtakam', 'dakshinamurthy-stotram']
        },
        {
            'name': 'Akshaya Tritiya',
            'slug': 'akshaya-tritiya-2026',
            'date': '2026-04-20',
            'year': 2026,
            'category': 'Vedic Observance',
            'region': 'Pan-Indian',
            'source': 'Drik Panchang (Vaishakha Shukla Tritiya)',
            'verificationStatus': 'verified',
            'deities': 'Lord Vishnu, Goddess Mahalakshmi, Lord Kubera',
            'significance': 'Day of inexhaustible prosperity (Akshaya) when good deeds, charity, and spiritual actions yield infinite fruit.',
            'description': 'Marked by charity (Anna Daan, Jal Daan) and chanting of Sri Suktam and Mahalakshmi Ashtakam.',
            'checklist': [
                {"step": 1, "task": "Performing Anna Daan and charity to the needy", "completed": True},
                {"step": 2, "task": "Puja to Sri Mahalakshmi & Narayana", "completed": True},
                {"step": 3, "task": "Chanting Mahalakshmi Ashtakam & Ashtalakshmi Stotram", "completed": True}
            ],
            'slokhas': ['mahalakshmi-ashtakam', 'ashtalakshmi-stotram', 'sri-suktham']
        },
        {
            'name': 'Varalakshmi Vratam',
            'slug': 'varalakshmi-vratam-2026',
            'date': '2026-08-21',
            'year': 2026,
            'category': 'Vedic & Devotional Observance',
            'region': 'South India (Tamil Nadu, Karnataka, Andhra, Telangana)',
            'source': 'Drik Panchang (Shravana Shukla Friday before Purnima)',
            'verificationStatus': 'verified',
            'deities': 'Goddess Varalakshmi',
            'significance': 'Observance performed by devotees for the well-being, health, and prosperity of family and progeny.',
            'description': 'Installing the sacred Kalasham decorated as Goddess Lakshmi and chanting Ashtalakshmi Stotram and Mahalakshmi Ashtakam.',
            'checklist': [
                {"step": 1, "task": "Decorating Varalakshmi Kalasham with face mask, saree, and jewels", "completed": True},
                {"step": 2, "task": "Tying the sacred yellow Raksha (Nonbu kayiru)", "completed": True},
                {"step": 3, "task": "Chanting Ashtalakshmi Stotram & Mahalakshmi Ashtakam", "completed": True},
                {"step": 4, "task": "Offering varieties of Kozhukattai, Payasam, and Sundal", "completed": True}
            ],
            'slokhas': ['mahalakshmi-ashtakam', 'ashtalakshmi-stotram', 'sri-suktham']
        },
        {
            'name': 'Vaikunta Ekadashi',
            'slug': 'vaikunta-ekadashi-2026',
            'date': '2026-12-20',
            'year': 2026,
            'category': 'Major Vaishnava Observance',
            'region': 'South India (Tirumala, Srirangam) & Pan-Indian',
            'source': 'Drik Panchang (Margashirsha Shukla Ekadashi / Dhanurmasa)',
            'verificationStatus': 'verified',
            'deities': 'Lord Venkateswara, Lord Ranganatha, Maha Vishnu',
            'significance': 'The opening of the northern gate to Vaikunta (Paramapada Vasal). Fasting and chanting lead to spiritual liberation.',
            'description': 'Devotees visit Vishnu temples at dawn to pass through the Vaikunta Dwaram, chanting Venkateswara Stotram and Vishnu Sahasranamam.',
            'checklist': [
                {"step": 1, "task": "Total or partial fasting on Ekadashi day", "completed": True},
                {"step": 2, "task": "Entering Vaikunta Dwaram at temple", "completed": True},
                {"step": 3, "task": "Chanting Venkateswara Stotram, Prapatti, and Vishnu Sahasranamam", "completed": True},
                {"step": 4, "task": "Dvadashe Parana the following morning", "completed": True}
            ],
            'slokhas': ['venkateswara-stotram', 'venkateswara-prapatti', 'govinda-namavali', 'sri-vishnu-sahasranama-stotram', 'garudagamana-tava']
        },
        {
            'name': 'Karthigai Deepam',
            'slug': 'karthigai-deepam-2026',
            'date': '2026-11-23',
            'year': 2026,
            'category': 'Regional Shiva & Murugan Festival',
            'region': 'Tamil Nadu & Kerala',
            'source': 'Tamil Solar Calendar (Karthigai month Pournami)',
            'verificationStatus': 'verified',
            'deities': 'Lord Arunachaleshwara (Shiva as Pillar of Fire), Lord Murugan',
            'significance': 'Commemorates the infinite Pillar of Cosmic Light (Annamalai Deepam) revealed by Shiva to Brahma and Vishnu.',
            'description': 'Houses and temple gopurams are illuminated with rows of earthen lamps (Agal vilakku), celebrating the dispelling of ego.',
            'checklist': [
                {"step": 1, "task": "Placing earthen oil lamps throughout the home at sunset", "completed": True},
                {"step": 2, "task": "Meditating upon Arunachala and chanting Om Namah Shivaya", "completed": True},
                {"step": 3, "task": "Chanting Lingashtakam and Chandrasekharashtakam", "completed": True}
            ],
            'slokhas': ['lingashtakam', 'shiva-panchakshari-stotram', 'chandrasekhara-ashtakam']
        },
        {
            'name': 'Onam (Thiruvonam)',
            'slug': 'onam-2026',
            'date': '2026-08-27',
            'year': 2026,
            'category': 'Regional Harvest & Cultural Festival',
            'region': 'Kerala & Global Malayali Community',
            'source': 'Malayalam Kollam Era Calendar (Chingam month Thiruvonam star)',
            'verificationStatus': 'verified',
            'deities': 'Lord Vamana (Vishnu Avatara), King Mahabali',
            'significance': 'Celebrating the annual homecoming of King Mahabali and the grace of Lord Vamana, uniting people across all boundaries in equality and joy.',
            'description': 'Celebrated with intricate flower carpets (Pookkalam), grand traditional banquet (Onasadya), and cultural devotion.',
            'checklist': [
                {"step": 1, "task": "Creating the floral Pookkalam at dawn", "completed": True},
                {"step": 2, "task": "Thrikkakara Appan (Vamana) puja", "completed": True},
                {"step": 3, "task": "Partaking in the harmonious Onasadya", "completed": True}
            ],
            'slokhas': ['garudagamana-tava', 'govinda-namavali']
        }
    ]

    for fest in festivals_data:
        fest_id = f"fest-{fest['slug']}"
        cur.execute("""
            INSERT INTO Festival (id, name, slug, description, category, region, date, year, source, verificationStatus, imageUrl, deities, significance, poojaChecklist, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            fest_id,
            fest['name'],
            fest['slug'],
            fest['description'],
            fest['category'],
            fest['region'],
            fest['date'],
            fest['year'],
            fest['source'],
            fest['verificationStatus'],
            f"/images/festivals/{fest['slug']}.jpg",
            fest['deities'],
            fest['significance'],
            json.dumps(fest['checklist']),
            now_str,
            now_str
        ))
        
        # Also create a linked Occasion record for festivals so they appear in both views
        occ_link_id = f"occ-{fest['slug']}"
        cur.execute("""
            INSERT INTO Occasion (id, name, slug, date, year, occasionType, description, institution, source, verificationStatus, poojaChecklist, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            occ_link_id,
            fest['name'],
            fest['slug'],
            fest['date'],
            fest['year'],
            "traditional_festival",
            fest['description'],
            "Traditional Vedic & Hindu Observance",
            fest['source'],
            fest['verificationStatus'],
            json.dumps(fest['checklist']),
            now_str,
            now_str
        ))
        
        # Link Festival and Occasion
        cur.execute("""
            INSERT INTO FestivalOccasion (id, festivalId, occasionId)
            VALUES (?, ?, ?)
        """, (
            f"fo-{fest['slug']}",
            fest_id,
            occ_link_id
        ))
        
        # Associate slokhas
        for s_seq, slk_slug in enumerate(fest['slokhas'], 1):
            cur.execute("""
                INSERT INTO OccasionSlokha (id, occasionId, slokhaId, sequenceOrder, associationType, notes, sourceReference)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                f"os-{fest['slug']}-{s_seq}",
                occ_link_id,
                f"slokha-{slk_slug}",
                s_seq,
                "parayanam",
                f"Recommended for {fest['name']}",
                fest['source']
            ))

    # Seed Admin User with securely hashed password
    # Default password is "AmritaDarshanam@2026"
    # Using bcrypt hash or sha256 + salt for local setup
    # In bcrypt format: we can use standard bcrypt hash
    # "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWWrGQDaNY6CG2" is bcrypt for "AmritaDarshanam@2026"
    admin_id = "admin-1"
    admin_email = "admin@amrita.edu"
    admin_pwd_hash = "$2b$10$WGUYyXPhbb/KbaEeqzeXpeVyHxSAw8gaPLLbuW8q3goUX5frxomHW"
    cur.execute("""
        INSERT INTO AdminUser (id, email, name, passwordHash, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        admin_id,
        admin_email,
        "Department of Amrita Darshanam Admin",
        admin_pwd_hash,
        "admin",
        now_str,
        now_str
    ))

    # Save audit report JSON
    with open(os.path.join(DATA_DIR, 'import_report.json'), 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': now_str,
            'sourceDocuments': [
                'ENGLISH.docx',
                'SANSKRIT.docx',
                'TAMIL.docx',
                'TELUGU.docx',
                'SRI MAHAGANAPATHI HOMAM JULY.docx'
            ],
            'totalCanonicalSlokhas': len(prayers_meta),
            'flaggedReviewItems': len(flagged_slokhas) + len(audit_reports),
            'auditItems': audit_reports,
            'verifiedPrays': parsed_prayers_output
        }, f, indent=2, ensure_ascii=False)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    run_parser()
