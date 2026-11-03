import type { PublicService } from '@/services/service';

export interface AstrologerProfile {
  id: string;
  name: string;
  avatar: string | null;
  qualification: string;
  experience: number;
  bio: string;
  location: string;
  services: PublicService[];
  specialties: string[];
  startingPrice: number;
}

export function buildAstrologerProfiles(
  services: PublicService[]
): AstrologerProfile[] {
  const profiles = new Map<string, AstrologerProfile>();

  for (const service of services) {
    const id = String(service.teacherId ?? '').trim();
    if (
      service.type !== 'astrology' ||
      service.status !== 'active' ||
      !id ||
      !Number.isFinite(service.price) ||
      service.price < 0
    )
      continue;

    const price = service.price;
    const existing = profiles.get(id);
    if (existing) {
      existing.services.push(service);
      existing.startingPrice = Math.min(existing.startingPrice, price);
      existing.avatar ||= service.consultantAvatar;
      existing.qualification ||= service.consultantQualification;
      existing.experience ||= service.consultantExperience;
      existing.bio ||= service.consultantBio;
      existing.location ||= service.consultantLocation;
      for (const tag of service.tags ?? []) {
        if (tag && !existing.specialties.includes(tag))
          existing.specialties.push(tag);
      }
      continue;
    }

    profiles.set(id, {
      id,
      name: service.consultantName?.trim() || 'Astrologer',
      avatar: service.consultantAvatar,
      qualification: service.consultantQualification || '',
      experience: service.consultantExperience || 0,
      bio: service.consultantBio || '',
      location: service.consultantLocation || '',
      services: [service],
      specialties: [...new Set((service.tags ?? []).filter(Boolean))],
      startingPrice: price,
    });
  }

  return [...profiles.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterAstrologerProfiles(
  profiles: AstrologerProfile[],
  searchQuery: string,
  priceRange: [number, number]
): AstrologerProfile[] {
  const query = searchQuery.trim().toLocaleLowerCase();
  return profiles.filter((profile) => {
    const searchable = [
      profile.name,
      profile.qualification,
      profile.location,
      profile.bio,
      ...profile.specialties,
      ...profile.services.flatMap((service) => [
        service.title,
        service.shortDescription,
      ]),
    ];
    const matchesSearch =
      !query ||
      searchable.some((value) => value?.toLocaleLowerCase().includes(query));
    const matchesPrice = profile.services.some(
      (service) =>
        Number.isFinite(service.price) &&
        service.price >= priceRange[0] &&
        service.price <= priceRange[1]
    );
    return matchesSearch && matchesPrice;
  });
}
