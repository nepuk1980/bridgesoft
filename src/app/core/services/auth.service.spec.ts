import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AuthService);
        localStorage.clear();
    });

    it('should clear the stored auth token from storage and memory', () => {
        service.setSession('test-token');

        expect(service.getToken()).toBe('test-token');
        expect(localStorage.getItem('accessToken')).toBe('test-token');

        service.clearSession();

        expect(service.getToken()).toBeNull();
        expect(localStorage.getItem('accessToken')).toBeNull();
    });
});
