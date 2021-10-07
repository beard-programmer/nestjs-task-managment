import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

const mockUser = {
  username: 'victor',
  id: 'id',
  password: 'password',
  tasks: [],
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('.getTasks', () => {
    beforeEach(() => {
      tasksRepository.getTasks.mockResolvedValue('get tasks result');
    });

    it('calls TasksRepository.getTasks and returns the result', async () => {
      expect(await tasksService.getTasks(null, mockUser)).toEqual(
        'get tasks result',
      );
    });
  });

  describe('.getTaskById', () => {
    beforeEach(() => {
      tasksRepository.findOne.mockResolvedValue('something was found');
    });

    it('calls TasksRepository.getTaskById and returns the result', async () => {
      expect(await tasksService.getTaskById('someId', mockUser)).toEqual(
        'something was found',
      );
    });

    describe('when task was not found', () => {
      beforeEach(() => {
        tasksRepository.findOne.mockResolvedValue(null);
      });

      it('calls TasksRepository.getTaskById and throws an error', async () => {
        expect(
          tasksService.getTaskById('someId', mockUser),
        ).rejects.toThrowError(NotFoundException);
      });
    });
  });

  describe('.createTask', () => {
    beforeEach(() => {
      tasksRepository.createTask.mockResolvedValue('task created');
    });

    it('calls TasksRepository.createTask and returns the result', async () => {
      expect(await tasksService.createTask(null, mockUser)).toEqual(
        'task created',
      );
    });
  });

  describe('.updateTaskStatus', () => {
    const taskToUpdate: Task = {
      id: 'id',
      title: 'title',
      description: 'description',
      status: TaskStatus.OPEN,
      user: mockUser,
    };

    beforeEach(() => {
      tasksRepository.findOne.mockResolvedValue(taskToUpdate);
      tasksRepository.save.mockResolvedValue();
    });

    it('finds via TasksService.getTaskById, changes the status, saves it by TasksRepository.save and returns updated task', async () => {
      expect(
        await tasksService.updateTaskStatus(
          'someid',
          TaskStatus.IN_PROGRESS,
          mockUser,
        ),
      ).toEqual({
        status: TaskStatus.IN_PROGRESS,
        id: 'id',
        title: 'title',
        description: 'description',
        user: mockUser,
      });
    });

    describe('when task was not found', () => {
      beforeEach(() => {
        tasksRepository.findOne.mockResolvedValue(undefined);
      });

      it('throws an error', async () => {
        expect(
          tasksService.updateTaskStatus(
            'someid',
            TaskStatus.IN_PROGRESS,
            mockUser,
          ),
        ).rejects.toThrowError(NotFoundException);
      });
    });
  });

  describe('.deleteTask', () => {
    beforeEach(() => {
      tasksRepository.delete.mockResolvedValue({ affected: 1 });
    });

    it('calls TasksRepository.delete and successfully returns', async () => {
      expect(await tasksService.deleteTask('taskId', mockUser)).toEqual(
        undefined,
      );
    });

    describe('when task for deletion was not found', () => {
      beforeEach(() => {
        tasksRepository.delete.mockResolvedValue({ affected: 0 });
      });

      it('calls TasksRepository.delete and throws an error', async () => {
        expect(
          tasksService.deleteTask('taskId', mockUser),
        ).rejects.toThrowError(NotFoundException);
      });
    });
  });
});
