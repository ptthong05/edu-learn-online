const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function seed() {
  const db = await open({ filename: path.join(__dirname, 'database.sqlite'), driver: sqlite3.Database });
  const existing = await db.all('SELECT id FROM blogs');
  console.log('Existing blogs:', existing.length);

  const now = new Date().toISOString();
  const d2 = new Date(Date.now() - 86400000 * 2).toISOString();
  const d4 = new Date(Date.now() - 86400000 * 4).toISOString();

  const blogs = [
    {
      id: 'blog-1',
      title: 'Hanh trang can chuan bi truoc khi nhay nganh',
      excerpt: 'Chuyen nganh sang linh vuc cong nghe khong bao gio la muon neu ban co su chuan bi ky cang. Bai viet nay se chia se nhung dieu ban can lam truoc khi bat dau hanh trinh.',
      content: '<h2>1. Xac dinh muc tieu ro rang</h2><p>Truoc khi nhay nganh, ban can biet ro minh muon den dau. Lap trinh web, mobile, AI hay data science? Moi huong di co lo trinh hoc tap va co hoi nghe nghiep rieng.</p><h2>2. Danh gia ky nang hien tai</h2><p>Hay liet ke nhung ky nang ban da co tu nganh cu. Nhieu ky nang mem nhu tu duy logic, giao tiep hay quan ly du an rat co gia tri trong nganh cong nghe.</p><h2>3. Len ke hoach hoc tap</h2><p>Dat moc thoi gian cu the: 3 thang hoc co ban, 6 thang xay dung portfolio, 9-12 thang ung tuyen. Ky luat voi lich hoc la chia khoa thanh cong.</p><h2>4. Xay dung mang luoi ket noi</h2><p>Tham gia cong dong lap trinh, cac buoi meetup, hackathon. Networking dong vai tro quan trong trong viec tim kiem co hoi viec lam dau tien.</p><p>Hanh trinh nhay nganh doi hoi su kien tri va quyet tam, nhung phan thuong xung dang dang cho nhung ai dam buoc ra khoi vung an toan.</p>',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      created_at: now
    },
    {
      id: 'blog-2',
      title: 'Ban da biet cach chay quang cao Facebook Ads chua?',
      excerpt: 'Facebook Ads la cong cu marketing manh me giup tiep can hang trieu khach hang tiem nang. Hay cung kham pha nhung bi quyet de toi uu chi phi va tang hieu qua chien dich.',
      content: '<h2>1. Hieu ro Facebook Ads</h2><p>Facebook Ads la nen tang quang cao tra phi cua Meta, cho phep ban tiep can dung doi tuong khach hang dua tren do tuoi, so thich, hanh vi va nhieu tieu chi khac.</p><h3>Tai sao nen su dung Facebook Ads?</h3><p>Voi hon 3 ty nguoi dung hang thang, Facebook la noi khach hang cua ban dang co mat. Chi phi quang cao linh hoat, co the bat dau voi ngan sach nho.</p><h3>Cac loai quang cao tren Facebook</h3><p>Facebook cung cap nhieu dinh dang quang cao: hinh anh, video, carousel, collection, instant experience... Moi dinh dang phu hop voi muc tieu khac nhau.</p><h2>2. Lap ke hoach cho chien dich hieu qua</h2><h3>Xac dinh muc tieu quang cao</h3><p>Ban muon tang nhan dien thuong hieu, tao traffic ve website, hay tang doanh so? Muc tieu ro rang giup Facebook toi uu phan phoi quang cao den dung nguoi.</p><p>Neu ban dang tim kiem mot phuong phap hieu qua de tiep can khach hang tiem nang va nang cao doanh so ban hang, thi Facebook Ads chinh la lua chon ly tuong.</p>',
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80',
      created_at: d2
    },
    {
      id: 'blog-3',
      title: 'Co nen dau tu vao tien ao khong? Nhung kenh dau tu hap dan nam 2025',
      excerpt: 'Thi truong tien dien tu ngay cang thu hut nhieu nha dau tu. Bai viet phan tich uu nhuoc diem va nhung dieu can biet truoc khi quyet dinh dau tu vao crypto.',
      content: '<h2>1. Tien ao la gi?</h2><p>Tien dien tu (cryptocurrency) la loai tien te ky thuat so su dung mat ma hoc de bao mat giao dich. Bitcoin, Ethereum, BNB... la nhung dong coin pho bien nhat hien nay.</p><h2>2. Tai sao nhieu nguoi quan tam den crypto?</h2><p>Loi nhuan tiem nang cao, giao dich 24/7, khong can qua trung gian ngan hang, va kha nang phi tap trung hoa tai chinh la nhung ly do chinh khien crypto hap dan nhieu nha dau tu.</p><h2>3. Rui ro can biet</h2><p>Bien dong gia manh, thieu quy dinh phap ly ro rang, nguy co bi hack hay mat vi... day la nhung rui ro ban phai hieu ro truoc khi dau tu crypto.</p><h2>4. Cac kenh dau tu hap dan nam 2025</h2><p>Ngoai crypto, nha dau tu nen da dang hoa danh muc voi: co phieu cong nghe, quy ETF, bat dong san so, va cac nen tang DeFi. Khong bo het trung vao mot gio la nguyen tac vang.</p>',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
      created_at: d4
    }
  ];

  for (const blog of blogs) {
    const exists = await db.get('SELECT id FROM blogs WHERE id = ?', [blog.id]);
    if (!exists) {
      await db.run(
        'INSERT INTO blogs (id, title, excerpt, content, image, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [blog.id, blog.title, blog.excerpt, blog.content, blog.image, blog.created_at]
      );
      console.log('Inserted:', blog.id, blog.title);
    } else {
      await db.run(
        'UPDATE blogs SET title=?, excerpt=?, content=?, image=?, created_at=? WHERE id=?',
        [blog.title, blog.excerpt, blog.content, blog.image, blog.created_at, blog.id]
      );
      console.log('Updated:', blog.id, blog.title);
    }
  }

  const all = await db.all('SELECT id, title FROM blogs');
  console.log('All blogs now:', JSON.stringify(all, null, 2));
  await db.close();
}

seed().catch(console.error);
