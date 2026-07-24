import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: authService,
          },
        ],
      }).compile();

    controller =
      module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass login credentials to AuthService', async () => {
    authService.login.mockResolvedValue({
      access_token: 'test-token',
    });

    await expect(
      controller.login({
        email: 'admin@amdox.com',
        password: 'admin123',
      }),
    ).resolves.toEqual({
      access_token: 'test-token',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'admin@amdox.com',
      'admin123',
    );
  });
});