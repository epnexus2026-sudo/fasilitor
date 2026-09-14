/** API katmanının kullandığı, HTTP durumu taşıyan hata tipi. */
export class ApiHatasi extends Error {
  readonly durum: number;
  readonly detay: unknown;

  constructor(durum: number, message: string, detay?: unknown) {
    super(message);
    this.name = 'ApiHatasi';
    this.durum = durum;
    this.detay = detay;
  }
}

export const hatalar = {
  gecersizIstek: (mesaj: string, detay?: unknown) => new ApiHatasi(400, mesaj, detay),
  yetkisiz: (mesaj = 'Oturum açmanız gerekiyor.') => new ApiHatasi(401, mesaj),
  yasak: (mesaj = 'Bu işlem için yetkiniz yok.') => new ApiHatasi(403, mesaj),
  bulunamadi: (mesaj = 'Kayıt bulunamadı.') => new ApiHatasi(404, mesaj),
  cakisma: (mesaj: string, detay?: unknown) => new ApiHatasi(409, mesaj, detay),
};
