import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function weightedThreatLevel(): number {
  const r = Math.random();
  if (r < 0.20) return 1;
  if (r < 0.45) return 2;
  if (r < 0.70) return 3;
  if (r < 0.88) return 4;
  return 5;
}

function generateCodename(): string {
  const animals = ["VIPER","RAVEN","WOLF","FOX","HAWK","COBRA","PHANTOM","GHOST","SHADOW","IRON","STEEL","ZERO","DELTA","ECHO","ALPHA"];
  const nums = String(faker.number.int({ min: 1, max: 99 })).padStart(2, "0");
  return `${faker.helpers.arrayElement(animals)}-${nums}`;
}

function generateMac(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join(":");
}

function generateImei(): string {
  return Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
}

const CITY_CLUSTERS = [
  { name: "New York",    lat: 40.7128,  lng: -74.0060 },
  { name: "London",      lat: 51.5074,  lng: -0.1278  },
  { name: "Tokyo",       lat: 35.6762,  lng: 139.6503 },
  { name: "Paris",       lat: 48.8566,  lng: 2.3522   },
  { name: "Dubai",       lat: 25.2048,  lng: 55.2708  },
  { name: "Moscow",      lat: 55.7558,  lng: 37.6173  },
  { name: "São Paulo",   lat: -23.5505, lng: -46.6333 },
  { name: "Singapore",   lat: 1.3521,   lng: 103.8198 },
];

function cityForProfile(index: number) {
  return CITY_CLUSTERS[index % CITY_CLUSTERS.length];
}

// ── Profiles ─────────────────────────────────────────────────────────────────

async function seedProfiles(count = 50) {
  console.log(`Seeding ${count} profiles...`);

  const occupations = [
    "Investment Banker", "Arms Dealer", "Intelligence Analyst",
    "Mercenary", "Diplomat", "Corporate Spy", "Hacker",
    "Former Military", "Crime Syndicate Leader", "Unknown",
    "Journalist", "Private Contractor", "Government Official",
  ];

  const statuses = ["active","active","active","dormant","flagged","ghost","terminated"];

  const profiles = Array.from({ length: count }, (_, i) => {
    const city = cityForProfile(i);
    const threat = weightedThreatLevel();
    return {
      codename: `${generateCodename()}-${i}`,
      legal_name: faker.person.fullName(),
      aliases: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => faker.internet.username()
      ),
      date_of_birth: faker.date.birthdate({ min: 25, max: 65, mode: "age" }).toISOString().split("T")[0],
      nationality: faker.location.countryCode(),
      occupation: faker.helpers.arrayElement(occupations),
      threat_level: threat,
      status: faker.helpers.arrayElement(statuses),
      biometric_hash: faker.string.hexadecimal({ length: 64, casing: "lower" }).replace("0x",""),
      last_known_location: `POINT(${city.lng + randomBetween(-0.05, 0.05)} ${city.lat + randomBetween(-0.05, 0.05)})`,
      profile_image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${faker.string.uuid()}`,
      metadata: {
        height_cm: faker.number.int({ min: 155, max: 200 }),
        weight_kg: faker.number.int({ min: 55, max: 110 }),
        eye_color: faker.helpers.arrayElement(["brown","blue","green","hazel","grey"]),
        hair_color: faker.helpers.arrayElement(["black","brown","blonde","red","grey","bald"]),
        languages: faker.helpers.arrayElements(["English","Russian","Mandarin","Arabic","French","Spanish"], { min: 1, max: 3 }),
        home_city: city.name,
      },
    };
  });

  const { data, error } = await supabase.from("profiles").insert(profiles).select("id, codename, metadata");
  if (error) { console.error("Profiles error:", error); return []; }
  console.log(`✓ ${data.length} profiles created`);
  return data;
}

// ── Locations ────────────────────────────────────────────────────────────────

async function seedLocations(profiles: { id: string; metadata: any }[]) {
  console.log("Seeding locations...");

  const sourceTypes = ["gps","cell_tower","wifi","visual","satellite","inferred"];
  const allLocations: any[] = [];

  for (const profile of profiles) {
    const city = CITY_CLUSTERS.find(c => c.name === profile.metadata?.home_city) ?? CITY_CLUSTERS[0];
    const pointCount = faker.number.int({ min: 20, max: 60 });
    let lat = city.lat + randomBetween(-0.03, 0.03);
    let lng = city.lng + randomBetween(-0.03, 0.03);

    for (let i = 0; i < pointCount; i++) {
      lat += randomBetween(-0.005, 0.005);
      lng += randomBetween(-0.005, 0.005);
      const source = faker.helpers.arrayElement(sourceTypes);

      allLocations.push({
        profile_id: profile.id,
        coordinates: `POINT(${lng} ${lat})`,
        accuracy_meters: source === "gps" ? randomBetween(3, 10)
          : source === "cell_tower" ? randomBetween(200, 800)
          : randomBetween(20, 100),
        velocity_kmh: randomBetween(0, 80),
        heading_degrees: Math.floor(randomBetween(0, 360)),
        source_type: source,
        timestamp: faker.date.recent({ days: 30 }).toISOString(),
        metadata: { source_detail: `${source.toUpperCase()}_${faker.string.alphanumeric(6)}` },
      });
    }
  }

  // Insert in batches of 500
  for (let i = 0; i < allLocations.length; i += 500) {
    const batch = allLocations.slice(i, i + 500);
    const { error } = await supabase.from("locations").insert(batch);
    if (error) console.error("Locations batch error:", error);
  }
  console.log(`✓ ${allLocations.length} locations created`);
}

// ── Devices ──────────────────────────────────────────────────────────────────

async function seedDevices(profiles: { id: string }[]) {
  console.log("Seeding devices...");

  const deviceTypes = ["smartphone","laptop","vehicle","wearable","iot","unknown"];
  const manufacturers = ["Apple","Samsung","Google","Huawei","Dell","Lenovo","Unknown"];
  const compromiseStatuses = ["uncompromised","uncompromised","partial","full","unknown"];
  const allDevices: any[] = [];

  for (const profile of profiles) {
    const deviceCount = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < deviceCount; i++) {
      allDevices.push({
        profile_id: profile.id,
        device_type: faker.helpers.arrayElement(deviceTypes),
        manufacturer: faker.helpers.arrayElement(manufacturers),
        model: faker.helpers.arrayElement(["Pro","X","Ultra","S23","Pixel 8","ThinkPad","Unknown"]),
        os_version: faker.helpers.arrayElement(["iOS 17","Android 14","Windows 11","Linux 6.1","Unknown"]),
        mac_address: generateMac(),
        ip_address: faker.internet.ipv4(),
        imei: generateImei(),
        first_seen: faker.date.past({ years: 2 }).toISOString(),
        last_seen: faker.date.recent({ days: 7 }).toISOString(),
        compromise_status: faker.helpers.arrayElement(compromiseStatuses),
        is_active: Math.random() > 0.2,
      });
    }
  }

  const { error } = await supabase.from("devices").insert(allDevices);
  if (error) console.error("Devices error:", error);
  else console.log(`✓ ${allDevices.length} devices created`);
}

// ── Communications ────────────────────────────────────────────────────────────

async function seedCommunications(profiles: { id: string }[]) {
  console.log("Seeding communications...");

  const commTypes = ["sms","voice","email","encrypted_message","dark_web","unknown"];
  const directions = ["inbound","outbound","internal"];
  const encStatuses = ["plaintext","plaintext","encrypted","decrypted","broken"];
  const redactedWords = ["████████","[REDACTED]","[CLASSIFIED]","███"];
  const allComms: any[] = [];

  for (const profile of profiles) {
    const commCount = faker.number.int({ min: 5, max: 20 });
    for (let i = 0; i < commCount; i++) {
      const recipient = faker.helpers.arrayElement(profiles.filter(p => p.id !== profile.id));
      const preview = faker.helpers.arrayElement([
        `Meeting at ${faker.helpers.arrayElement(redactedWords)} regarding ${faker.helpers.arrayElement(redactedWords)}`,
        `Package arrived at ${faker.helpers.arrayElement(redactedWords)}. Proceed as planned.`,
        `${faker.helpers.arrayElement(redactedWords)} confirmed. Asset in position.`,
        `Transfer complete. ${faker.helpers.arrayElement(redactedWords)} acknowledged.`,
        `Extraction point ${faker.helpers.arrayElement(redactedWords)}. 0${faker.number.int({min:1,max:9})}00 hours.`,
      ]);

      allComms.push({
        profile_id: profile.id,
        recipient_id: recipient?.id ?? null,
        communication_type: faker.helpers.arrayElement(commTypes),
        direction: faker.helpers.arrayElement(directions),
        timestamp: faker.date.recent({ days: 14 }).toISOString(),
        content_preview: preview,
        content_full: faker.lorem.paragraphs(2),
        encryption_status: faker.helpers.arrayElement(encStatuses),
        metadata: {
          carrier: faker.helpers.arrayElement(["Verizon","AT&T","T-Mobile","Unknown","Encrypted VPN"]),
          duration_seconds: faker.number.int({ min: 10, max: 600 }),
        },
      });
    }
  }

  // Batch insert
  for (let i = 0; i < allComms.length; i += 500) {
    const { error } = await supabase.from("communications").insert(allComms.slice(i, i + 500));
    if (error) console.error("Comms batch error:", error);
  }
  console.log(`✓ ${allComms.length} communications created`);
}

// ── Network Connections ───────────────────────────────────────────────────────

async function seedNetworkConnections(profiles: { id: string }[]) {
  console.log("Seeding network connections...");

  const connTypes = ["family","colleague","associate","romantic","adversarial","incidental","organizational","handler"];
  const connections: any[] = [];
  const seen = new Set<string>();

  for (const profile of profiles) {
    const connCount = faker.number.int({ min: 2, max: 8 });
    const candidates = profiles.filter(p => p.id !== profile.id);
    const targets = faker.helpers.arrayElements(candidates, connCount);

    for (const target of targets) {
      const key = [profile.id, target.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);

      connections.push({
        source_id: profile.id,
        target_id: target.id,
        connection_type: faker.helpers.arrayElement(connTypes),
        strength_score: parseFloat(randomBetween(0.1, 1.0).toFixed(2)),
        first_observed: faker.date.past({ years: 3 }).toISOString(),
        last_observed: faker.date.recent({ days: 30 }).toISOString(),
        evidence_count: faker.number.int({ min: 1, max: 50 }),
        is_active: Math.random() > 0.15,
        metadata: {
          meeting_location: faker.location.city(),
          notes: faker.helpers.arrayElement([
            "Confirmed via SIGINT","Visual confirmation","Financial trail","Communications intercept","Source report"
          ]),
        },
      });
    }
  }

  const { error } = await supabase.from("network_connections").insert(connections);
  if (error) console.error("Connections error:", error);
  else console.log(`✓ ${connections.length} network connections created`);
}

// ── Alerts ────────────────────────────────────────────────────────────────────

async function seedAlerts(profiles: { id: string }[]) {
  console.log("Seeding alerts...");

  const alertTypes = [
    "GEOFENCE_BREACH","ANOMALOUS_MOVEMENT","DEVICE_COMPROMISE",
    "COMMUNICATION_INTERCEPT","THREAT_ESCALATION","NETWORK_EXPANSION",
    "BIOMETRIC_MATCH","PATTERN_DEVIATION",
  ];

  const alerts = Array.from({ length: 30 }, () => ({
    alert_type: faker.helpers.arrayElement(alertTypes),
    target_profile_id: faker.helpers.arrayElement(profiles).id,
    severity: faker.number.int({ min: 1, max: 5 }),
    description: faker.helpers.arrayElement([
      "Target entered restricted zone perimeter",
      "Unusual travel velocity detected — possible aircraft transit",
      "Unknown device associated with target network",
      "Encrypted communication burst — 47 messages in 3 minutes",
      "Threat level escalated based on new intelligence",
      "New high-centrality node identified in target network",
      "Biometric match confirmed at border crossing",
      "Deviation from established daily pattern detected",
    ]),
    acknowledged: Math.random() > 0.6,
    triggered_at: faker.date.recent({ days: 7 }).toISOString(),
  }));

  const { error } = await supabase.from("alerts").insert(alerts);
  if (error) console.error("Alerts error:", error);
  else console.log(`✓ ${alerts.length} alerts created`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting God's Eye database seed...\n");

  const profiles = await seedProfiles(50);
  if (!profiles.length) { console.error("No profiles created, aborting."); return; }

  await seedLocations(profiles);
  await seedDevices(profiles);
  await seedCommunications(profiles);
  await seedNetworkConnections(profiles);
  await seedAlerts(profiles);

  console.log("\n✅ Seed complete. Database is live.");
}

main().catch(console.error);