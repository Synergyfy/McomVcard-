import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'

type MockRepo = Partial<Record<keyof Repository<any>, jest.Mock>>

function createMockRepo(): MockRepo {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  }
}

describe('UsersService', () => {
  let service: UsersService
  let repo: MockRepo

  beforeEach(async () => {
    repo = createMockRepo()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile()

    service = module.get(UsersService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('findById', () => {
    it('returns a user when found', async () => {
      const user = { id: 'u1', email: 'a@b.com' } as User
      repo.findOne!.mockResolvedValue(user)

      const result = await service.findById('u1')

      expect(result).toEqual(user)
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } })
    })

    it('returns null when not found', async () => {
      repo.findOne!.mockResolvedValue(null)

      const result = await service.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('returns all users', async () => {
      const users = [{ id: 'u1' }, { id: 'u2' }] as User[]
      repo.find!.mockResolvedValue(users)

      const result = await service.findAll()

      expect(result).toEqual(users)
      expect(repo.find).toHaveBeenCalled()
    })

    it('returns empty array when no users exist', async () => {
      repo.find!.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findByEmail', () => {
    it('returns a user when found', async () => {
      const user = { id: 'u1', email: 'test@example.com' } as User
      repo.findOne!.mockResolvedValue(user)

      const result = await service.findByEmail('test@example.com')

      expect(result).toEqual(user)
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    })

    it('returns null when not found', async () => {
      repo.findOne!.mockResolvedValue(null)

      const result = await service.findByEmail('missing@example.com')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('creates and returns a new user', async () => {
      const input = { email: 'new@example.com', passwordHash: 'hashed' }
      const created = { id: 'u1', ...input } as User
      repo.create!.mockReturnValue(created)
      repo.save!.mockResolvedValue(created)

      const result = await service.create(input)

      expect(repo.create).toHaveBeenCalledWith(input)
      expect(repo.save).toHaveBeenCalledWith(created)
      expect(result).toEqual(created)
    })

    it('returns first element when save returns array', async () => {
      const input = { email: 'a@b.com' }
      const saved = [{ id: 'u1', ...input }] as unknown as User[]
      repo.create!.mockReturnValue(input as any)
      repo.save!.mockResolvedValue(saved)

      const result = await service.create(input)

      expect(result).toEqual(saved[0])
    })
  })

  describe('update', () => {
    it('updates and returns the user', async () => {
      const updated = { id: 'u1', email: 'updated@b.com' } as User
      repo.update!.mockResolvedValue(undefined as any)
      repo.findOne!.mockResolvedValue(updated)

      const result = await service.update('u1', { email: 'updated@b.com' } as Partial<User>)

      expect(repo.update).toHaveBeenCalledWith({ id: 'u1' }, { email: 'updated@b.com' })
      expect(result).toEqual(updated)
    })

    it('returns null when updated user not found', async () => {
      repo.update!.mockResolvedValue(undefined as any)
      repo.findOne!.mockResolvedValue(null)

      const result = await service.update('nonexistent', { email: 'x@b.com' } as Partial<User>)

      expect(result).toBeNull()
    })
  })
})
