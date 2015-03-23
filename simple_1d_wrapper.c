/*
 * fftw test -- double precision
 */

#include <stdio.h>
#include "fftw3.h"
#define SIZE 2048


fftw_plan create_plan(int N, double* time_frame, fftw_complex* out, unsigned FLAG, int inverse) {
    if (inverse)
        return fftw_plan_dft_c2r_1d(N, out, time_frame, FLAG);
    else 
        return fftw_plan_dft_r2c_1d(N, time_frame, out, FLAG);
}


void fft_forward(int N, double* time_frame, double* fft_real, double* fft_imag)
{

    fftw_complex out[N / 2 + 1];
    fftw_plan p1 = fftw_plan_dft_r2c_1d(N, time_frame, out, FFTW_ESTIMATE);

    fftw_execute(p1);

    for (int i = 0; i < (N / 2 + 1); i++) {
        fft_real[i] = out[i][0];
        fft_imag[i] = out[i][1];
    }

    fftw_destroy_plan(p1);

    return;
}

void fft_inverse(int N, double* real, double* imag, double* time_frame)
{

    fftw_complex out[N / 2 + 1];

    fftw_plan p2 = fftw_plan_dft_c2r_1d(N, out, time_frame, FFTW_ESTIMATE);

    for (int i = 0; i < (N / 2 + 1); i++) {
        out[i][0] = real[i];
        out[i][1] = imag[i];
    }

    fftw_execute(p2);

    fftw_destroy_plan(p2);

    return;
}