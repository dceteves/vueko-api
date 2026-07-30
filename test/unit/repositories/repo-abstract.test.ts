import { vi, it, beforeEach, expect, describe } from "vitest";

import { Repository } from "../../../src/repositories/repository.abstract";

const mockDelegate = {
  create: vi.fn(),
  upsert: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

class CustomNotFoundError extends Error {
  constructor() {
    super("Custom not found error");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestRepository extends Repository<any> {
  protected getDelegate = () => mockDelegate;
  protected getNotFoundError = () => new CustomNotFoundError();
}

// ===========================================================================

describe("Repository", () => {
  const repo = new TestRepository();
  const mockId = "1";
  const mockData = {
    name: "player",
    age: 10,
    birthday: new Date(Date.now()),
  };
  const mockResource = { id: mockId, ...mockData };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "create");
      mockDelegate.create.mockResolvedValueOnce(mockResource);

      const result = await repo.create(mockData);

      expect(result).toStrictEqual(mockResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith(mockData);
    });
  });

  describe("findUnique", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "findUnique");
      mockDelegate.findUnique.mockResolvedValue(mockResource);

      const result = await repo.findUnique({ where: { id: "1" } });

      expect(result).toStrictEqual(mockResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith({ where: { id: "1" } });
    });
    it("throws not found error", async () => {
      const spy = vi.spyOn(repo, "findUnique");
      mockDelegate.findUnique.mockResolvedValue(null);

      const resultPromise = repo.findUnique({ where: { id: "nonexistent" } });

      await expect(resultPromise).rejects.toThrow("Custom not found error");

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { id: "nonexistent" },
      });
    });
  });

  describe("findMany", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "findMany");
      const mockResources = [mockResource, { id: "2", ...mockData }];
      mockDelegate.findMany.mockResolvedValue(mockResources);

      const result = await repo.findMany({ where: { name: "player" } });

      expect(result).toStrictEqual(mockResources);
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { name: "player" },
      });
    });
    it("returns empty array", async () => {
      const spy = vi.spyOn(repo, "findMany");
      mockDelegate.findMany.mockResolvedValue([]);

      const result = await repo.findMany({ where: { name: "nonexistent" } });

      expect(result).toStrictEqual([]);
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { name: "nonexistent" },
      });
    });
  });

  describe("update", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "update");
      const updatedResource = { id: mockId, ...mockData, name: "updated" };
      mockDelegate.update.mockResolvedValue(updatedResource);

      const result = await repo.update({
        where: { id: mockId },
        data: { name: "updated" },
      });

      expect(result).toStrictEqual(updatedResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { id: mockId },
        data: { name: "updated" },
      });
    });
  });

  describe("delete", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "delete");
      mockDelegate.delete.mockResolvedValue(mockResource);

      const result = await repo.delete({ where: { id: mockId } });

      expect(result).toStrictEqual(mockResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith({ where: { id: mockId } });
    });
  });

  describe("upsert", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "upsert");
      const upsertedResource = { id: mockId, ...mockData };
      mockDelegate.upsert.mockResolvedValue(upsertedResource);

      const result = await repo.upsert({
        where: { id: mockId },
        create: mockData,
        update: { name: "updated" },
      });

      expect(result).toStrictEqual(upsertedResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { id: mockId },
        create: mockData,
        update: { name: "updated" },
      });
    });
  });

  describe("findFirst", () => {
    it("returns", async () => {
      const spy = vi.spyOn(repo, "findFirst");
      mockDelegate.findFirst.mockResolvedValue(mockResource);

      const result = await repo.findFirst({ where: { name: "player" } });

      expect(result).toStrictEqual(mockResource);
      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { name: "player" },
      });
    });

    it("throws not found error", async () => {
      const spy = vi.spyOn(repo, "findFirst");
      mockDelegate.findFirst.mockResolvedValue(null);

      const resultPromise = repo.findFirst({ where: { name: "nonexistent" } });

      await expect(resultPromise).rejects.toThrow("Custom not found error");

      expect(spy).toHaveBeenCalledExactlyOnceWith({
        where: { name: "nonexistent" },
      });
    });
  });
});
