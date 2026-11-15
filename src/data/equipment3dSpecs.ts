import { Equipment3DSpec } from '../types/equipment';

export const EQUIPMENT_3D_SPECS: Record<string, Equipment3DSpec> = {
  'apollo-lm-descent-stages': {
    equipmentId: 'apollo-lm-descent-stages',
    environment: 'Moon',
    modelSummary:
      'Octagonal descent stage wrapped in gold Kapton multi-layer thermal insulation, four splayed landing legs, central descent engine bell, and crew egress ladder.',
    defaultCameraPosition: [5.4, 3.0, 5.6],
    defaultTarget: [0, 1.0, 0],
    hotspots: [
      {
        id: 'kapton-hull',
        name: 'Octagonal Kapton-Wrapped Hull',
        role: 'Primary structural bay & thermal protection',
        details:
          'Houses four descent propellant tanks, scientific experiment bays (Quad 1–4), and structural attachment points for the ascent stage.',
        position: [1.32, 1.36, -0.78],
        cameraOffset: [3.4, 2.2, -2.6]
      },
      {
        id: 'landing-gear',
        name: 'Crushable Landing Legs & Footpads',
        role: 'Energy-absorbing touchdown assembly',
        details:
          'Four aluminum honeycomb-strut legs with 0.94 m circular footpads absorbed landing shock across six Apollo touchdowns; each remains planted on the regolith.',
        position: [2.04, 0.28, 1.88],
        cameraOffset: [3.8, 1.2, 3.6]
      },
      {
        id: 'descent-engine',
        name: 'Descent Propulsion System Nozzle',
        role: 'Throttleable hypergolic landing engine',
        details:
          'First deep-throttling spacecraft rocket engine (10%–60% thrust), allowing commanders to hover and avoid boulders during final lunar touchdown.',
        position: [-0.42, 0.36, 0.44],
        cameraOffset: [-2.4, 0.95, 2.8]
      },
      {
        id: 'egress-ladder',
        name: 'Crew Egress Porch & 9-Rung Ladder',
        role: 'Astronaut surface access & plaque mount',
        details:
          'Mounted on the forward landing leg strut; includes the stainless-steel commemorative plaque left at each Apollo landing site.',
        position: [0.34, 1.08, 1.84],
        cameraOffset: [1.9, 1.4, 4.0]
      },
      {
        id: 'ascent-interface',
        name: 'Ascent Stage Separation Deck',
        role: 'Single-use orbital launch platform',
        details:
          'Served as the blast-deflector base when explosive bolts and guillotine cutters released the upper crewed ascent stage back toward lunar orbit.',
        position: [-0.46, 2.04, -0.36],
        cameraOffset: [2.8, 3.3, 2.8]
      }
    ]
  },
  'lunar-roving-vehicles': {
    equipmentId: 'lunar-roving-vehicles',
    environment: 'Moon',
    modelSummary:
      'Electric dual-seat lunar buggy featuring four woven wire-mesh tires, high-gain parabolic dish antenna, navigation console, and communications relay unit.',
    defaultCameraPosition: [4.5, 2.3, 4.7],
    defaultTarget: [0, 0.72, 0],
    hotspots: [
      {
        id: 'mesh-wheels',
        name: 'Woven Wire-Mesh Wheels & Hub Motors',
        role: 'Independent 4-wheel electric drive',
        details:
          'Zinc-coated piano-wire mesh tires with titanium chevron treads prevented flat tires in vacuum and dust; each wheel carried a 0.25 hp electric motor.',
        position: [1.14, 0.38, 1.18],
        cameraOffset: [2.9, 1.0, 3.0]
      },
      {
        id: 'high-gain-dish',
        name: 'High-Gain Parabolic Dish Antenna',
        role: 'Direct Earth television & telemetry link',
        details:
          'Umbrella-like gold-plated mesh reflector mounted at the front; aimed at Earth so controllers could remotely pan the TV camera during Apollo 15–17 liftoffs.',
        position: [0.56, 1.66, 1.24],
        cameraOffset: [2.2, 2.1, 3.2]
      },
      {
        id: 'nav-console',
        name: 'Dead-Reckoning Navigation & T-Handle',
        role: 'Astronaut steering & heading computer',
        details:
          'Tracked odometer pulses and directional gyro heading back to the Lunar Module so astronauts could navigate out of sight of the lander.',
        position: [-0.24, 1.18, 0.46],
        cameraOffset: [-2.1, 1.7, 2.5]
      },
      {
        id: 'crew-seats',
        name: 'Tubular Crew Seats & Tool Stowage',
        role: 'Two-astronaut mobility platform',
        details:
          'Lightweight aluminum-frame seats folded flat during launch inside Quadrant 1 of the LM descent stage, then unfolded on the lunar surface.',
        position: [-0.58, 0.96, -0.48],
        cameraOffset: [-2.7, 1.6, -2.5]
      },
      {
        id: 'battery-bay',
        name: 'Dual 36V Silver-Zinc Battery Bay',
        role: 'Non-rechargeable primary power source',
        details:
          'Carried in the forward chassis bay behind protective dust covers; powered traverses up to 35.9 km (LRV-3 on Apollo 17).',
        position: [-0.68, 0.68, 0.98],
        cameraOffset: [-2.4, 1.3, 2.9]
      }
    ]
  },
  'alsep-packages': {
    equipmentId: 'alsep-packages',
    environment: 'Moon',
    modelSummary:
      'Distributed nuclear-powered geophysical station with SNAP-27 radioisotope generator, central telemetry hub, ribbon cables, seismometer, and magnetometer.',
    defaultCameraPosition: [4.8, 2.6, 4.8],
    defaultTarget: [0, 0.55, 0],
    hotspots: [
      {
        id: 'snap27-rtg',
        name: 'SNAP-27 Radioisotope Generator',
        role: 'Plutonium-238 continuous power source',
        details:
          'Finned beryllium radiator cylinder generating ~70 watts continuously through two-week lunar nights until NASA commanded stations off in September 1977.',
        position: [-1.18, 0.62, 0.58],
        cameraOffset: [-3.1, 1.4, 2.4]
      },
      {
        id: 'central-station',
        name: 'ALSEP Central Station & Helical Mast',
        role: 'Command receiver & science data transmitter',
        details:
          'Thermal-controlled electronics box linking all surface instruments and beaming continuous geophysical telemetry to Earth.',
        position: [0, 1.56, 0],
        cameraOffset: [2.5, 2.1, 2.7]
      },
      {
        id: 'seismometer',
        name: 'Passive Seismic Experiment Dome',
        role: 'Moonquake & impact detector',
        details:
          'Covered by a shiny aluminized Mylar thermal shroud; detected four classes of moonquakes and revealed a partially molten deep lunar mantle.',
        position: [1.28, 0.52, 0.68],
        cameraOffset: [3.1, 1.3, 2.5]
      },
      {
        id: 'magnetometer',
        name: 'Lunar Surface Magnetometer Tripod',
        role: 'Three-axis magnetic field sensor',
        details:
          'Extended boom sensors measured weak remnant crustal magnetism and how the solar wind interacts with the Moon.',
        position: [0.48, 0.58, -1.24],
        cameraOffset: [2.4, 1.4, -3.1]
      }
    ]
  },
  'surveyor-1': {
    equipmentId: 'surveyor-1',
    environment: 'Moon',
    modelSummary:
      'Three-legged tubular spaceframe lander in Oceanus Procellarum with vertical solar mast, planar antenna, crushable footpads, and survey television camera.',
    defaultCameraPosition: [4.6, 2.7, 4.6],
    defaultTarget: [0, 1.15, 0],
    hotspots: [
      {
        id: 'tripod-frame',
        name: 'Tubular Aluminum Tripod & Footpads',
        role: 'Soft-landing structural chassis',
        details:
          'Three hinged legs with crushable honeycomb pads proved on June 2, 1966 that lunar regolith could support heavy Apollo landers without sinking.',
        position: [1.4, 0.28, 0.12],
        cameraOffset: [3.2, 1.2, 2.5]
      },
      {
        id: 'solar-mast',
        name: 'Solar Array Mast & Planar Antenna',
        role: 'Power generation & high-gain communications',
        details:
          'Elevated above the spaceframe to track the Sun and transmit 11,240 high-resolution surface images back to Earth.',
        position: [0.48, 2.46, 0.12],
        cameraOffset: [2.8, 3.1, 2.8]
      },
      {
        id: 'tv-turret',
        name: 'Survey Television Camera Turret',
        role: 'Panoramic mirror-scan optical imager',
        details:
          'Vertical vidicon camera fitted with a rotating mirror hood that surveyed the horizon and footpad soil imprints.',
        position: [0.4, 1.56, 0.54],
        cameraOffset: [2.4, 1.9, 2.6]
      }
    ]
  },
  'surveyor-3': {
    equipmentId: 'surveyor-3',
    environment: 'Moon',
    modelSummary:
      'Crater-slope twin to Surveyor 1 featuring its signature extendable pantograph soil mechanics scoop, resting at a tilt inside Surveyor Crater.',
    defaultCameraPosition: [4.7, 2.7, 4.7],
    defaultTarget: [0, 1.1, 0],
    hotspots: [
      {
        id: 'soil-scoop',
        name: 'Pantograph Soil Mechanics Scoop',
        role: 'First robotic lunar trenching arm',
        details:
          'Accordion-style arm dug four trenches and performed bearing-strength tests; later detached and returned to Earth by Apollo 12 astronauts in 1969.',
        position: [0.74, 0.68, 1.38],
        cameraOffset: [2.4, 1.4, 3.4]
      },
      {
        id: 'tv-camera',
        name: 'Survey TV Camera (Returned by Apollo 12)',
        role: 'Surface imaging & trench monitoring',
        details:
          'Returned 6,315 images before lunar night; retrieved by Pete Conrad and Alan Bean after 31 months of space exposure for Earth forensic study.',
        position: [0.36, 1.64, 0.48],
        cameraOffset: [2.2, 2.0, 2.7]
      },
      {
        id: 'tilted-tripod',
        name: 'Crater-Slope Tripod & Footpads',
        role: 'Tilted landing platform in Surveyor Crater',
        details:
          'Bounced twice during touchdown before settling at ~12° on the inner crater slope; main frame remains inside Surveyor Crater.',
        position: [-1.26, 0.44, -0.78],
        cameraOffset: [-3.1, 1.3, -2.5]
      }
    ]
  },
  'viking-1-lander': {
    equipmentId: 'viking-1-lander',
    environment: 'Mars',
    modelSummary:
      'Hexagonal Martian lander with three landing legs, twin finned RTG thermal covers, articulated S-band dish antenna, meteorology boom, and soil sampler arm.',
    defaultCameraPosition: [4.8, 2.5, 4.8],
    defaultTarget: [0, 0.88, 0],
    hotspots: [
      {
        id: 'sband-dish',
        name: 'S-Band High-Gain Dish Antenna',
        role: 'Direct Mars-to-Earth data link',
        details:
          'Steerable 0.76 m parabolic dish; an accidental 1982 command mispointed the dish, ending over six years of Chryse Planitia contact.',
        position: [-0.52, 1.82, -0.58],
        cameraOffset: [-2.4, 2.4, -2.6]
      },
      {
        id: 'rtg-units',
        name: 'Twin SNAP-19 RTG Power Covers',
        role: 'Long-duration nuclear electrical power',
        details:
          'Provided steady electricity and waste heat for 2,245 sols through Martian dust storms and frigid nights.',
        position: [1.32, 1.05, 0],
        cameraOffset: [3.3, 1.6, 2.2]
      },
      {
        id: 'biology-lab',
        name: 'Hexagonal Chassis & Biology Experiment Bay',
        role: 'Automated soil chemistry & life-search lab',
        details:
          'Housed three metabolic biology experiments and a gas chromatograph-mass spectrometer analyzing oxidizing Martian soil.',
        position: [-0.78, 1.05, 0.68],
        cameraOffset: [-2.4, 1.5, 2.9]
      },
      {
        id: 'sample-arm',
        name: 'Extendable Soil Sampler Arm & Boom',
        role: 'Regolith trenching & meteorology',
        details:
          'Scooped Chryse Planitia dust and pebbles into onboard hoppers while the meteorology boom recorded 6+ years of pressure cycles.',
        position: [0.48, 0.96, 1.42],
        cameraOffset: [2.3, 1.6, 3.3]
      }
    ]
  },
  'viking-2-lander': {
    equipmentId: 'viking-2-lander',
    environment: 'Mars',
    modelSummary:
      'Northern-plains Viking lander resting at an ~8° tilt with one footpad atop a dark basalt boulder amid seasonal water-ice frost at Utopia Planitia.',
    defaultCameraPosition: [4.8, 2.5, 4.8],
    defaultTarget: [0, 0.9, 0],
    hotspots: [
      {
        id: 'boulder-tilt',
        name: '8° Boulder-Tilted Footpad',
        role: 'Utopia Planitia touchdown stance',
        details:
          'One landing leg came to rest atop a basalt rock, tilting the lander ~8 degrees without disrupting 1,281 sols of science.',
        position: [1.35, 0.35, 0.95],
        cameraOffset: [3.2, 1.2, 2.8]
      },
      {
        id: 'seismometer',
        name: 'Uncaged Martian Seismometer Housing',
        role: 'Wind & seismic vibration detector',
        details:
          'Unlike Viking 1, Viking 2 successfully uncaged its seismometer and monitored northern-plains wind vibrations.',
        position: [-0.85, 1.12, 0.45],
        cameraOffset: [-2.3, 1.7, 2.8]
      },
      {
        id: 'frost-cameras',
        name: 'Facsimile Cameras & Frost Terrain',
        role: 'Seasonal water-ice frost discovery',
        details:
          'Twin rotating scan cameras photographed thin winter coatings of water-ice frost across Utopia Planitia.',
        position: [0.42, 1.52, 0.62],
        cameraOffset: [2.4, 2.1, 2.7]
      }
    ]
  },
  'sojourner-rover': {
    equipmentId: 'sojourner-rover',
    environment: 'Mars',
    modelSummary:
      'Compact six-wheeled Mars Pathfinder scout rover with rocker-bogie suspension, flat top solar array, gold Warm Electronics Box, and rear APXS spectrometer.',
    defaultCameraPosition: [3.2, 1.8, 3.4],
    defaultTarget: [0, 0.42, 0],
    hotspots: [
      {
        id: 'rocker-bogie',
        name: 'Six-Wheel Rocker-Bogie Suspension',
        role: 'All-terrain obstacle-climbing chassis',
        details:
          'Pioneered the passive articulated six-wheel suspension scaled up for Spirit, Opportunity, Curiosity, and Perseverance.',
        position: [0.74, 0.26, 0.64],
        cameraOffset: [2.2, 0.95, 2.2]
      },
      {
        id: 'solar-deck',
        name: 'Top Photovoltaic Solar Panel',
        role: 'Daytime solar power & thermal lid',
        details:
          'Powered 83 sols of exploration (~100 m traversed around Ares Vallis) alongside non-rechargeable backup batteries.',
        position: [0, 0.78, 0.1],
        cameraOffset: [2.0, 1.8, 2.2]
      },
      {
        id: 'apxs-sensor',
        name: 'Alpha Proton X-Ray Spectrometer (APXS)',
        role: 'In-situ elemental rock analyzer',
        details:
          'Rear-mounted sensor pressed directly against rocks nicknamed Barnacle Bill and Yogi to determine mineral chemistry.',
        position: [0, 0.44, -1.04],
        cameraOffset: [1.9, 1.0, -2.6]
      }
    ]
  },
  'spirit-rover': {
    equipmentId: 'spirit-rover',
    environment: 'Mars',
    modelSummary:
      'Mars Exploration Rover MER-A with arrowhead triangular solar wings, stereo Pancam mast, High-Gain Dish, and six-wheel rocker-bogie trapped in sulfate sand at Troy.',
    defaultCameraPosition: [4.3, 2.3, 4.4],
    defaultTarget: [0, 0.78, 0],
    hotspots: [
      {
        id: 'pancam-mast',
        name: 'Pancam Stereo Camera Mast',
        role: 'Elevated color panorama & navigation eyes',
        details:
          '1.5 m tall mast carrying wide-angle Navcams and high-resolution Pancams that surveyed Gusev Crater and dust devils.',
        position: [0.22, 1.88, 0.58],
        cameraOffset: [2.3, 2.3, 2.7]
      },
      {
        id: 'solar-wings',
        name: 'Triangular Solar Wing Array',
        role: 'Rechargeable lithium-ion power system',
        details:
          'Sustained Spirit for 2,208 sols until immobilization at Troy prevented tilting the wings toward the winter Sun in 2010.',
        position: [-1.08, 1.05, -0.15],
        cameraOffset: [-2.9, 1.9, 2.3]
      },
      {
        id: 'troy-wheel',
        name: 'Immobilized Wheel at "Troy" Sand Trap',
        role: 'Backward-driving silica discovery & final resting spot',
        details:
          'After its right-front wheel seized, dragging the wheel backward churned up bright pure silica evidence of ancient hot springs before becoming trapped in soft sulfate sand.',
        position: [0.95, 0.28, -0.88],
        cameraOffset: [2.7, 0.95, -2.6]
      },
      {
        id: 'rat-arm',
        name: 'Robotic Arm & Rock Abrasion Tool',
        role: 'Grinding & microscopic mineral lab',
        details:
          'Held the Rock Abrasion Tool (RAT), Microscopic Imager, APXS, and Mössbauer spectrometer to analyze Columbia Hills outcrops.',
        position: [0.12, 0.68, 1.38],
        cameraOffset: [2.1, 1.3, 3.1]
      }
    ]
  },
  'opportunity-rover': {
    equipmentId: 'opportunity-rover',
    environment: 'Mars',
    modelSummary:
      'Record-setting 45.16 km Mars Exploration Rover MER-B with dust-coated triangular solar wings, Pancam mast, and High-Gain Dish in Perseverance Valley.',
    defaultCameraPosition: [4.3, 2.3, 4.4],
    defaultTarget: [0, 0.78, 0],
    hotspots: [
      {
        id: 'dust-wings',
        name: 'Dust-Coated Solar Wing Array',
        role: '5,111-sol endurance power deck',
        details:
          'Powered nearly 15 Earth years of exploration until the June 2018 planet-encircling dust storm starved Opportunity of sunlight.',
        position: [1.08, 1.05, -0.15],
        cameraOffset: [2.9, 1.9, 2.3]
      },
      {
        id: 'pancam-eyes',
        name: 'Pancam Mast & Mini-TES Mirror',
        role: 'Mineralogy & crater rim surveying',
        details:
          'Captured layered sedimentary bedrock across Eagle, Endurance, Victoria, and Endeavour craters.',
        position: [0.22, 1.88, 0.58],
        cameraOffset: [2.3, 2.3, 2.7]
      },
      {
        id: 'mer-wheels',
        name: '45.16 km Marathon Rocker-Bogie Drive',
        role: 'Record off-world mobility system',
        details:
          'Covered 45.16 km across Meridiani Planum, verifying ancient water-laid hematite spherules and clay-rich gypsum veins.',
        position: [-0.95, 0.28, 0.88],
        cameraOffset: [-2.7, 1.1, 2.7]
      },
      {
        id: 'hga-dish',
        name: 'High-Gain Dish & UHF Whip Antenna',
        role: 'Orbiter relay & direct-to-Earth link',
        details:
          'Relayed science via Mars Odyssey and MRO until Opportunity sent its final signal on June 10, 2018.',
        position: [-0.54, 1.42, -0.72],
        cameraOffset: [-2.4, 1.9, -2.6]
      }
    ]
  }
};
