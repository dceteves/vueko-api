export const mockProfile = {
  id: "1",
  username: "player",
  displayName: "player",
};

export const mockOsuProfile = {
  ...mockProfile,
  avatar_url: "https://example.com/mock.png",
  country_code: "US",
  provider: "osu",
};

export const mockDiscordProfile = {
  ...mockProfile,
  provider: "discord",
};
