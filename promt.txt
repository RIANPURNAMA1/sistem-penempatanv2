<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CV {{ $cv->nama_lengkap_romaji }}</title>

    {{-- <!-- <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    /> --> --}}
</head>
<style>
    body {
        font-size: 10px !important;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
    }

    table td,
    table th {
        border: 1px solid #000 !important;
        padding: 2px;
        vertical-align: top;
    }

    .btn-container {
        margin-bottom: 1rem;
        display: flex;
        gap: 10px;
        /* jarak antar tombol */
    }

    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        text-decoration: none;
        /* agar <a> mirip tombol */
        display: inline-block;
        transition: background-color 0.3s ease;
    }

    /* Warna tombol */
    .btn-success {
        background-color: #28a745;
    }

    .btn-success:hover {
        background-color: #218838;
    }

    .btn-primary {
        background-color: #007bff;
    }

    .btn-primary:hover {
        background-color: #0069d9;
    }

    .btn-info {
        background-color: #17a2b8;
    }

    .btn-info:hover {
        background-color: #138496;
    }



    .rirekisho-table {
        border-collapse: collapse;
        width: 100%;
    }

    /* Gaya dasar sel tabel */
    .rirekisho-table th,
    .rirekisho-table td {

        padding: 3px 8px;
        vertical-align: middle;
    }

    /* Styling untuk baris Judul Utama */
    .title-row th {

        text-align: left;
        border-bottom: none !important;
        border-top: none !important;
        border-left: none !important;
        border-right: none !important;
    }

    /* Container untuk 日現在 */
    .date-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        /* gap-1 */
        padding-right: 0;
        vertical-align: bottom;
        border-top: none !important;
        border-left: none !important;
        border-right: none !important;
        border-bottom: none !important;
    }

    /* Styling untuk garis putus-putus */
    .dotted-border {
        border-width: 0 1px 1px 0 !important;
    }

    /* Bagian Nama dan Gender */
    .name-row .family-name {
        width: 25%;
        /* w-1/4 */
        text-align: center;
        text-transform: uppercase;
        border-right: none;
    }

    .name-row .given-name {
        width: 50%;
        /* w-2/4 */
        text-align: center;
        text-transform: uppercase;
        border-left: none;
        border-right: none;
    }

    /* Baris input nama */
    .input-name-row .dotted-border {
        text-align: center;
        border-bottom: 0 !important;
    }

    /* Kelas untuk sel Gender */
    .gender-cell {
        writing-mode: vertical-rl;
        text-orientation: upright;
        width: 20px;
        padding: 0;
        text-align: center;
    }

    /* Baris Tanggal Lahir */
    .birthdate-row .label-cell {
        width: 120px;
        /* w-[120px] */
        text-align: center;
    }

    .birthdate-row .year-cell {
        width: 20%;
        /* w-1/5 */
        text-align: center;
    }

    .birthdate-row .narrow-cell {
        width: 50px;
        text-align: center;
    }

    /* Bagian Keluarga dan Pendapatan */
    .family-header th {
        text-align: center;
    }

    .family-row .narrow-left {
        width: 30px;
        /* w-[30px] */
    }

    .family-row .main-cell {
        width: 50%;
        /* w-1/2 */
        height: 20px;
        /* h-10 */
    }

    .family-row .narrow-right {
        width: 30px;
        /* w-[30px] */
    }

    .income-row .label-cell {
        width: 25%;
        /* w-1/4 */
        text-align: center;

    }

    .income-row .data-cell {}
</style>
<style>
    .btn-container {
        margin-bottom: 1rem;
        display: flex;
        gap: 10px;
    }

    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.3s ease;
    }

    .btn-success {
        background-color: #28a745;
    }

    .btn-success:hover {
        background-color: #218838;
    }

    .btn-primary {
        background-color: #007bff;
    }

    .btn-primary:hover {
        background-color: #0069d9;
    }

    .btn-info {
        background-color: #17a2b8;
    }

    .btn-info:hover {
        background-color: #138496;
    }

    /* Hanya untuk print */
    @media print {
        .btn-container {
            display: none !important;
        }
    }
</style>



<body class="p-4">
    <div class="btn-container d-flex gap-2 flex-wrap">

        <!-- Print PDF -->
        <button class="btn btn-success" onclick="window.print()">印刷 PDF</button>

        <!-- Translate to Japanese -->
        <button class="btn btn-success" onclick="translateToJapanese()">Ubah ke bahasa jepang</button>

        <!-- Capitalize Text -->
        <button class="btn btn-primary" onclick="capitalizeText()">Huruf Awal Kapital</button>

        <!-- Back Button -->
        <a href="/data/cv/kandidat" class="btn btn-info" style="font-size: 12px">Kembali</a>

    </div>


    <div class="container2 d-flex" style="">

        <div class="container" style="display: flex; justify-content:center;  gap: 1rem">
            <div class="" id="cvArea">
                @php
                    // Memecah nama lengkap menjadi Nama Belakang + Nama Depan
                    $nama = explode(' ', $cv->nama_lengkap_romaji);
                    $namaBelakang = $nama[0] ?? '';
                    $namaDepan = $nama[1] ?? '';
                @endphp

                <!-- ========================================= -->
                <!-- 名前（FAMILY NAME / GIVEN NAME） -->
                <!-- ========================================= -->
                <table border="1" cellspacing="0" cellpadding="2" style="width: 450px; border-collapse: collapse;"
                    class="">
                    <thead>
                        <tr>
                            <td style="text-align:center;">姓（FAMILY NAME）</td>
                            <td style="text-align:center;">名（GIVEN NAME）</td>
                            <td width="20" rowspan="" style="text-align:center;">性別</td>
                        </tr>
                    </thead>
                    <tbody>

                        <!-- Baris input utama -->
                        <tr>
                            <td rowspan="" style="height: 50px; text-align:center;">
                                {{ $namaBelakang }}
                            </td>
                            <td style="text-align:center;">
                                {{ $namaDepan }}
                            </td>
                            <td rowspan="" style="text-align:center; border-bottom:none;">
                                {{ $cv->jenis_kelamin == '男 (Laki-laki)' ? '男' : '女' }}
                            </td>
                        </tr>

                        <tr>
                            <td ro style="text-align:center;">姓</td>
                            <td style="text-align:center;">名</td>
                        </tr>


                        <!-- Baris kosong tambahan -->
                        <tr style="text-align: center">

                            <td style="height: 20px;">{{ $namaBelakang }}</td>
                            <td> {{ $namaDepan }}</td>

                        </tr>
                    </tbody>
                </table>



                <table border="1" cellspacing="0"
                    style="width: 450px; border-collapse: collapse; border-top: none;">
                    <tr>
                        <td style="width: 120px; padding: 0.5rem;">生年月日</td>

                        <td style="padding-left: 0.5rem;">
                            {{-- Format tanggal lahir --}}
                            {{ \Carbon\Carbon::parse($cv->tanggal_lahir)->format('Y') }} 年
                            {{ \Carbon\Carbon::parse($cv->tanggal_lahir)->format('m') }} 月
                            {{ \Carbon\Carbon::parse($cv->tanggal_lahir)->format('d') }} 日

                            {{-- Tempat lahir dan usia --}}
                            （{{ $cv->tempat_lahir }} ・ 満 {{ $cv->usia }} 歳）
                        </td>
                    </tr>
                </table>


                <!-- ========================= -->
                <!-- Alamat） -->
                <!-- ========================= -->
                <table border="1" cellspacing="0"
                    style="width: 450px; border-collapse: collapse; margin-top: 1rem;">
                    <thead>
                        <tr>
                            <td style="text-align:center; height: 25px;">
                                フリガナ
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 60px; padding-left: 5px;">
                                現住所：{{ $cv->alamat_lengkap ?? '-' }}<br>
                                {{ $cv->kelurahan ?? '-' }}, {{ $cv->kecamatan ?? '-' }}<br>
                                {{ $cv->kabupaten ?? '-' }}, {{ $cv->provinsi ?? '-' }}

                            </td>
                        </tr>
                    </thead>
                </table>

                <!-- ========================= -->
                <!--        学歴（Riwayat Pendidikan） -->
                <!-- ========================= -->
                <table border="1" cellspacing="0"
                    style="width: 450px; border-collapse: collapse; margin-top: 1rem;">
                    <thead>
                        <tr>
                            <td colspan="3" style="text-align:center; height: 25px;">学歴</td>
                        </tr>
                        <tr>
                            <td style="width: 150px; text-align:center;">年／月 ～ 年／月</td>
                            <td style="width: 200px; text-align:center;">学校名</td>
                            <td style="width: 100px; text-align:center;">学部等</td>
                        </tr>
                    </thead>

                    <tbody>
                        @forelse ($cv->pendidikans as $p)
                            <tr>
                                <td style="height: 30px; text-align:center;">
                                    {{ $p->tahun_masuk }} - {{ $p->tahun_lulus }}
                                </td>
                                <td style="padding-left: 5px;">
                                    {{ $p->nama }}
                                </td>
                                <td style="text-align:center;">
                                    {{ $p->jurusan }}
                                </td>
                            </tr>
                        @empty
                            <!-- Jika tidak ada data → tetap tampil baris kosong seperti format awal -->
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>


                <!-- Spacer -->
                <div style="height: 15px;"></div>

                <!-- ========================= -->
                <!--        職歴（Riwayat Pekerjaan） -->
                <!-- ========================= -->
                <table border="1" cellspacing="0" style="width: 450px; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <td colspan="3" style="text-align:center; height: 25px;">職歴</td>
                        </tr>
                        <tr>
                            <td style="width: 150px; text-align:center;">年／月 ～ 年／月</td>
                            <td style="width: 200px; text-align:center;">会社名</td>
                            <td style="width: 100px; text-align:center;">職種</td>
                        </tr>
                    </thead>

                    <tbody>
                        @forelse ($cv->pengalamans as $k)
                            <tr>
                                <td style="height: 30px; text-align:center;">
                                    {{ $k->tanggal_masuk }} - {{ $k->tanggal_keluar }}
                                </td>
                                <td style="padding-left:5px;">
                                    {{ $k->perusahaan }}
                                </td>
                                <td style="text-align:center;">
                                    {{ $k->jabatan }}
                                </td>
                            </tr>
                        @empty
                            <!-- Jika tidak ada data → tampilkan baris kosong seperti format asli -->
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="height: 30px;"></td>
                                <td></td>
                                <td></td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>

                <!-- ========================= -->
                <!--   現在の収入（Income Section） -->
                <!-- ========================= -->
                <table border="1" cellspacing="0" style="width: 450px; border-collapse: collapse; border-top:none;">
                    <tr>
                        <td style="padding: 5px;">
                            現在の収入（無職の場合は最終職歴時の収入）
                        </td>
                        <td style="width: 60px; text-align:center;">万円</td>
                    </tr>
                </table>


                <!-- BAGIAN KELUARGA DAN PENDAPATAN -->
                <table border="1" cellspacing="0" cellpadding="2" class="rirekisho-table"
                    style="margin-top: 1rem; border-collapse: collapse;">
                    <thead>
                        <tr class="family-header" style="text-align: center">
                            <td colspan="4">
                                家族構成(及び年齢)
                            </td>
                        </tr>
                    </thead>

                    <tbody>

                        <!-- AYAH -->
                        <tr class="family-row">
                            <td class="narrow-left">父</td>
                            <td class="main-cell">{{ $cv->ayah_nama }}</td>
                            <td class="narrow-right">{{ $cv->ayah_pekerjaan }}</td>
                            <td class="" style="width: 20px">{{ $cv->ayah_usia }}</td>
                        </tr>

                        <!-- IBU -->
                        <tr class="family-row">
                            <td class="narrow-left">母</td>
                            <td class="main-cell">{{ $cv->ibu_nama }}</td>
                            <td class="main-cell">{{ $cv->ibu_pekerjaan }}</td>
                            <td class="narrow-right">{{ $cv->ibu_usia }}</td>
                        </tr>

                        <!-- SUAMI -->
                        @if ($cv->istri_nama)
                            <tr class="family-row">
                                <td class="narrow-left">夫/妻</td>
                                <td class="main-cell">{{ $cv->istri_nama }}</td>
                                <td class="main-cell">{{ $cv->istri_pekerjaan }}</td>
                                <td class="narrow-right">{{ $cv->istri_usia }}</td>
                            </tr>
                        @endif

                        <!-- ISTRI -->
                        @if ($cv->anggota_keluarga_istri)
                            <tr class="family-row">
                                <td class="narrow-left">妻</td>
                                <td class="main-cell">{{ $cv->anggota_keluarga_istri }}</td>
                                <td class="main-cell"></td>
                                <td class="narrow-right"></td>
                            </tr>
                        @endif

                        <!-- ANAK -->
                        @if ($cv->anak_nama)
                            <tr class="family-row">
                                <td class="narrow-left">子</td>
                                <td class="main-cell">{{ $cv->anak_nama }}</td>
                                <td class="main-cell">{{ $cv->anak_pendidikan }}</td>
                                <td class="narrow-right">{{ $cv->anak_usia }}</td>
                            </tr>
                        @endif

                        <!-- KAKAK -->
                        @if ($cv->kakak_nama)
                            <tr class="family-row">
                                <td class="narrow-left">兄弟(上)</td>
                                <td class="main-cell">{{ $cv->kakak_nama }}</td>
                                <td class="main-cell">{{ $cv->kakak_pekerjaan }}</td>
                                <td class="narrow-right">{{ $cv->kakak_usia }}</td>
                            </tr>
                        @endif

                        <!-- ADIK -->
                        @if ($cv->adik_nama)
                            <tr class="family-row">
                                <td class="narrow-left">兄弟(下)</td>
                                <td class="main-cell">{{ $cv->adik_nama }}</td>
                                <td class="main-cell">{{ $cv->adik_pekerjaan }}</td>
                                <td class="narrow-right">{{ $cv->adik_usia }}</td>
                            </tr>
                        @endif

                        <!-- Baris Pendapatan Keluarga -->
                        <tr class="income-row">
                            <td colspan="2" style="width: 10px !important;" class="label-cell">
                                家族の収入
                                <div class="subtitle"></div>
                            </td>
                            <td colspan="2" class="data-cell">
                                {{ $cv->rata_rata_penghasilan_keluarga }}
                            </td>
                        </tr>

                    </tbody>
                </table>


                {{-- <!-- HOBI -->
                <!-- HOBI -->
                <table border="1" cellspacing="0" cellpadding="6"
                    style="width: 450px; border-collapse: collapse; font-size: 10px;">
                    <tbody>
                        <tr>
                            <td style="width: 80px;">趣味</td>
                            <td style="width: 370px; text-align: center;">
                                {{ $cv->hobi }}
                            </td>
                        </tr>
                    </tbody>
                </table> --}}


                {{-- kelebihan --}}
                <table border="1" cellspacing="0" cellpadding="6"
                    style="margin-top: 1rem; width: 450px; border-collapse: collapse; font-size: 10px;">
                    <thead>
                        <tr>
                            <td style="width: 225px; text-align: center;">長所</td>
                            <td style="width: 225px; text-align: center;">先生からのコメント</td>
                        </tr>
                        <tr>
                            <td style="height: 20px; text-align:center;">
                                {{ $cv->kelebihan_diri ?? '-' }}
                            </td>
                            <td style="text-align:center;">
                                {{ $cv->komentar_guru_kelebihan_diri ?? '-' }}
                            </td>
                        </tr>
                    </thead>
                </table>

                {{-- kekuranbgan --}}
                <table border="1" cellspacing="0" cellpadding="6"
                    style="margin-top: 1rem; width: 450px; border-collapse: collapse; font-size: 10px;">
                    <thead>
                        <tr>
                            <td style="width: 225px; text-align: center;">短所</td>
                            <td style="width: 225px; text-align: center;">先生からのコメント</td>
                        </tr>
                        <tr>
                            <td style="height: 20px; text-align:center;">
                                {{ $cv->kekurangan_diri ?? '-' }}
                            </td>
                            <td style="text-align:center;">
                                {{ $cv->komentar_guru_kekurangan_diri ?? '-' }}
                            </td>
                        </tr>
                    </thead>
                </table>



                <table border="1" cellspacing="0" cellpadding="6"
                    style="margin-top: 1rem; width: 450px; border-collapse: collapse; font-size: 10px;">
                    <tr>
                        <td height="20px" style="text-align:center;">興味・関心</td>
                    </tr>
                    <tr>
                        <td height="20px" style="vertical-align: top; padding: 6px;">
                            {{ $cv->ketertarikan_terhadap_jepang ?? '-' }}
                        </td>
                    </tr>
                </table>


                <!-- ORANG YANG DIHORMATI -->
                <table border="1" cellspacing="0" cellpadding="6"
                    style="margin-top: 1rem; width: 450px; border-collapse: collapse; font-size: 10px;">
                    <tr>
                        <td height="20px" style="text-align:center;">尊敬する人(及びその理由)</td>
                    </tr>
                    <tr>
                        <td height="20px" style="vertical-align: top; padding: 6px;">
                            {{ $cv->orang_yang_dihormati ?? '-' }}
                        </td>
                    </tr>
                </table>



                <table border="1" cellspacing="0" cellpadding="6"
                    style="margin-top: 1rem; width: 450px; border-collapse: collapse; font-size: 10px;">
                    <tr>
                        <td height="20px" style="text-align:center;">メモ / コメント</td>
                    </tr>
                    <tr>
                        <td height="20px" style="vertical-align: top; padding: 6px;">

                            {{ $cv->komentar_guru_kelebihan_diri ?? '-' }}<br><br>


                            {{ $cv->komentar_guru_kekurangan_diri ?? '-' }}
                        </td>
                    </tr>
                </table>

            </div>

            <div>
                <div style="display: flex; position: relative;">
                    <table border="0" cellspacing="0" style="height: 200px; width: 140px;">
                        <thead>
                            <tr>

                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 0; text-align: center;">
                                    @if ($cv->pas_foto_cv)
                                        <img src="{{ asset($cv->pas_foto_cv) }}" alt="Foto Kandidat"
                                            style="width: 100%; height: 200px; object-fit: cover; display: block;">
                                    @else
                                        <span style="font-size: 10px;">Tidak ada foto</span>
                                    @endif
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <!-- Nomor (contoh: ID CV) -->
                    <h1 style="position: absolute; top: -1rem; right: -3rem; font-size: 10px">
                        {{ $cv->id }}
                    </h1>
                </div>


                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="6"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td>出身地</td>
                            <td>宗教</td>
                        </tr>
                        <tr>
                            <td style="height: 30px;">
                                {{ $cv->tempat_lahir ?? '-' }}
                            </td>
                            <td>
                                {{ $cv->agama ?? '-' }}
                                @if ($cv->agama_lainnya)
                                    <br>({{ $cv->agama_lainnya }})
                                @endif
                            </td>
                        </tr>
                    </table>
                </div>


                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="6"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td>配偶者の有無</td>
                            <td>子供</td>
                        </tr>
                        <tr>
                            <td style="height: 30px;">
                                {{ $cv->status_perkawinan ?? '-' }}
                            </td>
                            <td>
                                {{ $cv->anak_nama ?? '-' }}
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="6"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td colspan="2">免許</td>
                        </tr>
                        <tr>
                            <td style="height: 20px; width: 40px;">
                                {{ $cv->surat_izin_mengemudi ?? '無' }}
                                @if ($cv->surat_izin_mengemudi == 'Ada' && $cv->jenis_sim)
                            </td>
                            <td>
                                ({{ $cv->jenis_sim }})
                            </td>
                            @endif
                        </tr>
                    </table>
                </div>


                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="6"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td>趣味</td>
                        </tr>
                        <tr>
                            <td style="height: 20px;">
                                {{ $cv->hobi ?? '-' }}
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="6"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td>特技</td>
                        </tr>
                        <tr>
                            <td style="height: 20px; text-align: center; padding: 6px;">
                                {{ $cv->keahlian_khusus ?? '-' }}
                            </td>
                        </tr>
                    </table>
                </div>



                <div style="padding-top: 1rem;">
                    <table border="1" cellspacing="0" cellpadding="4"
                        style="width: 260px; border-collapse: collapse; font-size: 10px; text-align: center;">
                        <tr>
                            <td style="width: 100px;">タバコ</td>
                            <td style="width: 100px;">飲酒</td>
                        </tr>
                        <tr>
                            <td style="height: 20px;">
                                {{ $cv->merokok ?? '-' }}
                            </td>
                            <td>
                                {{ $cv->minum_alkohol ?? '-' }}
                            </td>
                        </tr>
                    </table>
                </div>

                <table border="1" cellpadding="4" cellspacing="0"
                    style="border-collapse: collapse; width: 260px; text-align:center; margin-top:1rem; font-size: 10px;">
                    <tr>
                        <td>身長</td>
                        <td style="width:40px;">{{ $cv->tinggi_badan ?? '-' }}</td>
                        <td>cm</td>

                        <td>体重</td>
                        <td style="width:40px;">{{ $cv->berat_badan ?? '-' }}</td>
                        <td>kg</td>
                    </tr>
                    <tr>
                        <td>腰</td>
                        <td>{{ $cv->ukuran_pinggang ?? '-' }}</td>
                        <td>cm</td>

                        <td>靴</td>
                        <td>{{ $cv->ukuran_sepatu ?? '-' }}</td>
                        <td>cm</td>
                    </tr>
                </table>


                <table border="1" cellpadding="3" cellspacing="0"
                    style="border-collapse: collapse; width:260px; margin-top:20px; text-align:center; font-size:10px;">
                    <tr>
                        <td>{{ $cv->ukuran_atasan_baju ?? '' }}</td>
                        <td>服サイズ</td>

                        <td>血液型</td>
                        <td>{{ $cv->golongan_darah ?? '' }}</td>
                    </tr>
                    <tr>
                        <td rowspan="2">視力</td>
                        <td>右：{{ $cv->tangan_dominan ?? '' }}</td>

                        <td rowspan="2">視力</td>
                        <td rowspan="2">{{ $cv->kemampuan_penglihatan_mata ?? '' }}</td>
                    </tr>
                    <tr>
                        <td>利き手：{{ $cv->tangan_dominan ?? '' }}</td>
                    </tr>
                </table>

                <table border="1" cellpadding="3" cellspacing="0"
                    style="border-collapse: collapse; width:260px; margin-top:20px; text-align:center; font-size:10px;">
                    <tr>
                        <td>日本語学習期間</td>
                    </tr>
                    <tr>
                        <td>{{ $cv->lama_belajar_di_mendunia ?? '' }}</td>
                    </tr>
                </table>

                <table border="1" cellpadding="6" cellspacing="0"
                    style="border-collapse: collapse; width:260px; margin-top:20px; text-align:center;">
                    <tr>
                        <td>日本語
                            能力</td>
                        <td>{{ $cv->kemampuan_bahasa_jepang }}</td>
                        <td>機敏性</td>
                        <td>{{ $cv->kelincahan_dalam_bekerja }}</td>
                    </tr>
                    <tr>
                        <td>忍耐力</td>
                        <td>A</td>
                        <td>行動力</td>
                        <td>{{ $cv->kekuatan_tindakan }}</td>
                    </tr>
                    <tr>
                        <td>理解力</td>
                        <td>{{ $cv->kemampuan_pemahaman_ssw }}</td>
                        <td>英語力</td>
                        <td>{{ $cv->kemampuan_berbahasa_inggris }}</td>
                    </tr>
                </table>
                <table border="1" cellpadding="3" cellspacing="0"
                    style="border-collapse: collapse; width:260px; margin-top:20px; text-align:center;">
                    <tr>
                        <td>お祈り</td>
                        <td style="width: 140px"></td>

                    </tr>
                    <tr>
                        <td>断食</td>
                        <td></td>

                    </tr>
                    <tr>
                        <td>実習希望期間</td>
                        <td></td>

                    </tr>
                </table>
                <table border="1" cellpadding="3" cellspacing="0"
                    style="border-collapse: collapse; width:260px; border-top:none; text-align:center;">
                    <tr>
                        <td rowspan="5" style=" writing-mode: vertical-rl; padding: 5px;">体力 テス ト</td>
                        <!-- contoh isi kolom kiri -->
                    </tr>
                    <tr>
                        <td>腕立</td>
                    </tr>
                    <tr>
                        <td>1回目 :27回 2回目 :21回 3回目 :17回</td>
                    </tr>
                    <tr>
                        <td>スクワット</td>
                    </tr>
                    <tr>
                        <td style="padding: 1rem"></td>
                    </tr>

                </table>
            </div>
        </div>
    </div>

    </div>
    {{-- sertifikat --}}
    <div class=" mt-4">
        <div class="">
            <div class="card-body d-flex justify-content-center" style="display: flex; justify-content: center;">
                {{-- SERTIFIKAT --}}
                {{-- <tr>

                    <td>
                        @php
                            $sertifikats = json_decode($cv->sertifikat_files, true) ?? [];
                        @endphp

                        @if (count($sertifikats) === 0)
                            <span class="text-muted">Tidak ada file</span>
                        @else
                            <div class="d-flex flex-wrap gap-2">
                                @foreach ($sertifikats as $file)
                                    @php
                                        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                                        $url = asset($file);
                                    @endphp

                                    @if (in_array($ext, ['jpg', 'jpeg', 'png']))
                                        <a href="{{ $url }}" target="_blank">
                                            <img src="{{ $url }}"
                                                style="width:300px; height:auto; object-fit:cover; border-radius:8px; border:1px solid #ccc;">
                                        </a>
                                    @elseif ($ext === 'pdf')
                                        <a href="{{ $url }}" target="_blank" class="btn btn-danger btn-sm">
                                            <i class="bi bi-file-earmark-pdf"></i> PDF Sertifikat
                                        </a>
                                    @else
                                        <a href="{{ $url }}" target="_blank"
                                            class="btn btn-secondary btn-sm">
                                            <i class="bi bi-file-earmark-text"></i> Lihat Dokumen
                                        </a>
                                    @endif
                                @endforeach
                            </div>
                        @endif
                    </td>
                </tr> --}}
            </div>
        </div>
    </div>


</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous">
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js"></script>
<script>
    function capitalizeText() {
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.querySelector('.container2'),
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        }

        textNodes.forEach(node => {
            node.nodeValue = node.nodeValue.replace(/\b\w/g, char => char.toUpperCase());
        });
    }

    async function translateToJapanese() {
        // Ambil semua elemen teks
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.querySelector('.container2'),
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        }

        // Kirim teks ke API penerjemah
        for (let node of textNodes) {
            const originalText = node.nodeValue.trim();
            try {
                const translated = await translateText(originalText);
                node.nodeValue = translated; // replace teks asli
            } catch (err) {
                console.error('Terjemahan gagal untuk:', originalText, err);
            }
        }
    }

    // Contoh fungsi translate via API publik (DeepL atau Google Translate)
    async function translateText(text) {
        // Contoh menggunakan API Google Translate gratis via fetch
        const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|ja`);
        const data = await res.json();
        return data.responseData.translatedText;
    }

    function printSheet() {
        const container = document.querySelector('.container');

        html2canvas(container, {
            scale: 2
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
        });
    }


    function downloadPDF() {
        const container = document.querySelector('.container2');


        html2canvas(container, {
            scale: 2
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save('mensetsu_sheet.pdf');
        });
    }
</script>

</html>
