import React, { useState, useEffect } from 'react';
import { FaTimes, FaAd, FaExternalLinkAlt } from 'react-icons/fa';

const amazonProducts = [
  {
    "url": "https://www.amazon.in/AI-Engineering-Building-Applications-Foundation/dp/9355426666?pd_rd_w=TMfLI&content-id=amzn1.sym.f7d06212-3555-43aa-92e8-0a66aa167653&pf_rd_p=f7d06212-3555-43aa-92e8-0a66aa167653&pf_rd_r=5ZNCY76Z4GA210XAKSK2&pd_rd_wg=MsZ1m&pd_rd_r=0b797457-ce41-4efd-8799-b19e39eb41f7&pd_rd_i=9355426666&psc=1&linkCode=ll2&tag=vishweshshind-21&linkId=f55e9504ccb03ff07d087f367cd8241e&ref_=as_li_ss_tl",
    "title": "AI Engineering",
    "image": "https://m.media-amazon.com/images/I/41Lazf3TXIL.jpg"
  },
  {
    "url": "https://www.amazon.in/Statistics-Pelican-Books-David-Spiegelhalter/dp/0241258766?pd_rd_w=N5j7H&content-id=amzn1.sym.7ccbe032-5929-4c88-ab39-4923842061df&pf_rd_p=7ccbe032-5929-4c88-ab39-4923842061df&pf_rd_r=5ZNCY76Z4GA210XAKSK2&pd_rd_wg=MsZ1m&pd_rd_r=0b797457-ce41-4efd-8799-b19e39eb41f7&pd_rd_i=0241258766&psc=1&linkCode=ll2&tag=vishweshshind-21&linkId=0099c6c9ee83d2b8f8f22ef26cb7b947&ref_=as_li_ss_tl",
    "title": "The Art of Statistics",
    "image": "https://m.media-amazon.com/images/I/41avZxZMM4L.jpg"
  },
  {
    "url": "https://www.amazon.in/Designing-Machine-Learning-Systems-Production-Ready/dp/9355422679?crid=1JK4UWE9QZA35&dib=eyJ2IjoiMSJ9.C8lGdn64oMyIXwZXGtrfHLmpm9BRDVqf5ztAH3PzRlbsMToKlLBzlreqizaLCnv6LB6XW8ZDsUjAbk76Sj0unw-dlyT0OnztsSpwAxECGkLyHRlOM7vJU70--xhupi5dAfEWSFfah3tR_5kYtpeFKMggWlbGa5_c29jab2rkupY-jV336X4ol1h5f8cxTvabv3--idcMDgea_CFvC1Qtqku1Vcma9PC78OAbGDaCUvE.nbusH5b99vMiRNFGUiOFhBMt7vSwBfm3NBpD_EpYWBQ&dib_tag=se&keywords=system+design+books&qid=1783943502&sprefix=system+design+boo%2Caps%2C395&sr=8-4&linkCode=ll2&tag=vishweshshind-21&linkId=b7c3bfad2c56f8377ae9c9ac00d33b21&ref_=as_li_ss_tl",
    "title": "Designing Machine Learning Systems",
    "image": "https://m.media-amazon.com/images/I/416C6effXYL.jpg"
  },
  {
    "url": "https://www.amazon.in/dp/8131775690?_encoding=UTF8&ie=UTF8&psc=1&sp_csd=d2lkZ2V0TmFtZT1zcF9yaGZfc2VhcmNoX3BlcnNvbmFsaXplZA%3D%3D&sp_cr=ZAZ&aref=yymEGOYVce&pd_rd_w=rhiLi&content-id=amzn1.sym.048e108a-5c49-437b-8e3e-5a6a1a1095d2&pf_rd_p=048e108a-5c49-437b-8e3e-5a6a1a1095d2&pf_rd_r=3C696Q1V2NPZ3AY7YTYJ&pd_rd_wg=FFceb&pd_rd_r=c2fb68b1-fdcb-43fe-9b0e-1f030d8a59b0&linkCode=ll2&tag=vishweshshind-21&linkId=064c32d991005193536a2ac8e1bf6297&ref_=as_li_ss_tl",
    "title": "NoSQL Distilled",
    "image": "https://m.media-amazon.com/images/I/51x1W+G81FL.jpg"
  },
  {
    "url": "https://www.amazon.in/Designing-Data-Intensive-Applications-Maintainable-Greyscale/dp/9368089043?crid=1JK4UWE9QZA35&dib=eyJ2IjoiMSJ9.GdNLA7ckLiRVvXEtKws-Y_WhdOwJPWMv98QuYsLE4cr0eU_pLz-k4ZHQacauwQzGTtWTetjRl12m2db_YXV_wXwEm39d7zdNshiUhWVQXTnDru_o9OMe9x9-5Az6WJL5M998c7Bfu8BmdrhDy6FvsKFgSsBKm-F56uWX_UD2xJa2TqavPm9ra4A1njD-QC8ehyP2UV836h1Ulhn2_xVSDohqAUqCGwmveolShEE5JIY.mGovanjb-J4G1GZZ8gZTJY-002Q7QYfImU-BaB6-x-I&dib_tag=se&keywords=system+design+books&qid=1783943477&sprefix=system+design+boo%2Caps%2C395&sr=8-4&linkCode=ll2&tag=vishweshshind-21&linkId=c2ff957cb3fafc9dbf4ff9155aeb5057&ref_=as_li_ss_tl",
    "title": "Designing Data-Intensive Applications",
    "image": "https://m.media-amazon.com/images/I/41z6ygHEpTL.jpg"
  },
  {
    "url": "https://www.amazon.in/Data-Structures-Algorithms-Made-Easy/dp/8193245288?crid=2IMYXCPRJPGTB&dib=eyJ2IjoiMSJ9.TCVFjH6p_cH2f33vVRwDP_lweJnBl3O_Zi1pkTmUPV54QV9vVv2LYPL9TVOdCYJY8UylQzLjGBINblaVYVaOzkgUKMRC_DfjW52tOdGkEBTvoAgyK6t2y8pzaJSY1LACNvzuJxIOUivm7Hs_ZRFSvohX4pLwcCXJLBGwyE0ZOFxwHec8bCGsqIDDpQRGHM17z4R0Ap5NqsA91GbGY5aO05QimbtV-rejklFc3DhAOaE.BNLjDYI8HDA5z-yG-TzBB7UCFlGaYLusrF-nRiBcHnk&dib_tag=se&keywords=coding+books&qid=1783943385&sprefix=coding+bo%2Caps%2C388&sr=8-6&linkCode=ll2&tag=vishweshshind-21&linkId=5d96d8a365d20f3361ddb8aa715efb6d&ref_=as_li_ss_tl",
    "title": "Data Structures And Algorithms Made Easy",
    "image": "https://m.media-amazon.com/images/I/51qBToforeL.jpg"
  },
  {
    "url": "https://www.amazon.in/Introduction-Coding-Scratch-Brain-Crack/dp/9386671123?crid=2IMYXCPRJPGTB&dib=eyJ2IjoiMSJ9.TCVFjH6p_cH2f33vVRwDP_lweJnBl3O_Zi1pkTmUPV54QV9vVv2LYPL9TVOdCYJY8UylQzLjGBINblaVYVaOzkgUKMRC_DfjW52tOdGkEBTvoAgyK6t2y8pzaJSY1LACNvzuJxIOUivm7Hs_ZRFSvohX4pLwcCXJLBGwyE0ZOFxwHec8bCGsqIDDpQRGHM17z4R0Ap5NqsA91GbGY5aO05QimbtV-rejklFc3DhAOaE.BNLjDYI8HDA5z-yG-TzBB7UCFlGaYLusrF-nRiBcHnk&dib_tag=se&keywords=coding+books&qid=1783943385&sprefix=coding+bo%2Caps%2C388&sr=8-4&linkCode=ll2&tag=vishweshshind-21&linkId=752b13aa0f64a83e7fb9f7f5d3fd1a2d&ref_=as_li_ss_tl",
    "title": "Introduction to Coding – Scratch Your Brain",
    "image": "https://m.media-amazon.com/images/I/51T-kynRwYL.jpg"
  },
  {
    "url": "https://www.amazon.in/Algorithms-Every-Programmer-Should-Know/dp/1803247762?crid=3FVWYYKNSFDI1&dib=eyJ2IjoiMSJ9.t-bVoBihW0vhDICbfYp7Jv8hkkhCDP51VjA45PQqCVpO6gwBsgtNOGMicbwH0aZxwvH6DpO9IHaJd5RPkqDZjLG3bfw5_Q1B9DpkaIAWkA15mKbK9Lm_N48BAVbI0Rxt1l_yUAvYZMjFHD0DQDgpHp56HdnASFHCLLxfrlGAo87KSFJHYhMjYv4yviQYu2m5So_DWM-789o04m1MbO20kP0Mpg6DVcaporvTrDrVFLU.Gpmuz7K8i1VL9NbxR8onsILKkohWtNL9e-50g-iJdS0&dib_tag=se&keywords=50+Algorithms+Every+Programmer+%282nd+Ed.%29&qid=1783943321&sprefix=50+algorithms+every+programmer+2nd+ed.+%2Caps%2C407&sr=8-1&linkCode=ll2&tag=vishweshshind-21&linkId=1979787e3bdc0708c72fc12bcf940054&ref_=as_li_ss_tl",
    "title": "50 Algorithms Every Programmer Should Know",
    "image": "https://m.media-amazon.com/images/I/416EGE4de6L.jpg"
  },
  {
    "url": "https://www.amazon.in/Elements-Programming-Interviews-Adnan-Aziz/dp/9382359443?crid=7YXNW2VHDZZ8&dib=eyJ2IjoiMSJ9.OxfkdxBfVgAYNeG7n3slhWigySJkQT_8ht1ceb0MSHT1fP6oz734dtGA3hIHTuCXn8F2QRTQkE4U01QY3fhGwXibHmZbW8E9s39umGuJopSUG-Db9sFCPUsPDrFLxxPJcmBxMVIktk0fqVLPprWM5MZ32OW_MyCnv319bU6_MP4qyzboaU7N5T9VYUrguTbwRcYkeW3Ol92ID0ao5yOpC-amVZA9HRg3IDhEv4V3quM.F55v-zPZUp7HAl46ttgqcXt9d685n2qd7M4q3pCYAqs&dib_tag=se&keywords=Elements+of+Programming+Interviews&qid=1783943279&sprefix=elements+of+programming+interviews%2Caps%2C440&sr=8-3&linkCode=ll2&tag=vishweshshind-21&linkId=3ddcfa072d2148e41a46830ecbd5b933&ref_=as_li_ss_tl",
    "title": "Elements of Programming Interviews",
    "image": "https://m.media-amazon.com/images/I/41VfQ++AbvL.jpg"
  },
  {
    "url": "https://www.amazon.in/System-Design-Interview-Insiders-Colour/dp/9355428863?crid=3EFFY8Y8QXMNS&dib=eyJ2IjoiMSJ9.R5bQmrAqMOECpq1G6Tnx-FWmjhXCFXKcw673NprwDK0XUo23R9edz70hPX6K4vou-kpx0IwjW6SmWJs5oe5R-03mejORDvK7BMv4T2R63RqOuz1kHmRX5SV9w_rgKRO6vSbZmEs6Puxs29enDGmsPvBxlihfCSKzuTYPjh1vbdnFAw6xyvqHakVp0DvG57SRrzydDyOiODaZEvlB7joAl1XrjGithAOoCgsWDflIPe8.db-AC4kzsGnanxVNTblabsQy2mYVnMwK562W0Zl0CG0&dib_tag=se&keywords=System+Design+Interview+%E2%80%93+Vol.2&qid=1783943256&sprefix=system+design+interview+vol.2%2Caps%2C402&sr=8-2&linkCode=ll2&tag=vishweshshind-21&linkId=f846e3ce5ece419a089e20b7f9db168d&ref_=as_li_ss_tl",
    "title": "System Design Interview - Vol. 2",
    "image": "https://m.media-amazon.com/images/I/41GHa6zzO1L.jpg"
  },
  {
    "url": "https://www.amazon.in/Rocketbook-Eco-Friendly-Digitally-Connected-Ambidextrous/dp/B087QQ1JV7?crid=ATAZAV2UJ8QR&dib=eyJ2IjoiMSJ9.BAoOe-89rKLVLr9d5ieYunR6n4UQ3pmBLmn0bexv4uKoniWFTPpcDDPnqaNVUxwnAfJqovy3rSQ-gJeiUAy45_ei6aq9Z6V3REsN8EgQsn6eWJilIrnTQ6TSC0SRsx138jgVs5iRfMIgEcKrOQWXUbwWIwphBCZi9ca9BRLOWcTC3lw72bkNL5QVQGp-nqsZI_phbQ2viJtCyts6OyBNbV20OHhN4yaGPszDy5R3YgBqifK86Z49O93-pkKbkZyFLdLlqRAkfWqdPZCobwjYQpHjdYf55YjH1TnebdopO34.1E0ZHgdn1TbUoW36OtwrzU_L_ATQUK77lEJmxELF4xU&dib_tag=se&keywords=Rocketbook%2BCore%2BReusable%2BNotebook%2B%288.5%C3%9711%29&nsdOptOutParam=true&qid=1783943185&sprefix=rocketbook%2Bcore%2Breusable%2Bnotebook%2B8.5%2B11%2B%2Caps%2C358&sr=8-5&th=1&linkCode=ll2&tag=vishweshshind-21&linkId=1653834a9c333053b54eb0d25d36386d&ref_=as_li_ss_tl",
    "title": "Rocketbook Core Reusable Smart Notepad",
    "image": "https://m.media-amazon.com/images/I/41IxqYpN45L.jpg"
  },
  {
    "url": "https://www.amazon.in/gp/aw/d/B09LMLQ8TZ?_encoding=UTF8&pd_rd_plhdr=t&hsa_cr_id=0&qid=1783943185&sr=1-1-e0fa1fdd-d857-4087-adda-5bd576b25987&i=aps&aref=ZoC8fUlYjJ&pd_rd_w=UkONl&content-id=amzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05%3Aamzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_p=9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_r=0602RCBDN202NCDHV36A&pd_rd_wg=43nXz&pd_rd_r=bb5164b8-8bcf-4d58-bb35-89502ea892f9&linkCode=ll2&tag=vishweshshind-21&linkId=b6e35e8d7542ec4e551a1eeb8b36891a&ref_=as_li_ss_tl",
    "title": "Rays Of Ink Infinity Reusable Notebook",
    "image": "https://m.media-amazon.com/images/I/31Xs5qVfo9L.jpg"
  },
  {
    "url": "https://www.amazon.in/System-Design-Interview-Insiders-Colour/dp/9355427190?crid=20JMEK38N1GD9&dib=eyJ2IjoiMSJ9.ikw32lhv36fv6eiL20T3o2D3NwjpmiMaAeroApWey5YHm9Vb3TVFOd-AsMWtVzjUO8RgFVMJU7osGwdQT8cbed37E0gL-XQSH_vdLOWJgXPtyk24GQMi3uUhKz3xP_Yqm-XZizgXM-WzsOVjlrTVM26pUYuP4_6gxKh1_uhFqB_o4aDTUGCgmJW80FI1GUYG2vTH822WBr4WwD8XIzhyzvv-kPzGLTZvLDoH68zebLQ.h6g__1c3-I71KFr04btoG0CFa7tKWzIcBfjmenpfKOs&dib_tag=se&keywords=System+Design+Interview+%E2%80%93+An+Insider%E2%80%99s+Guide+%28Vol.1%29&nsdOptOutParam=true&qid=1783943126&sprefix=system+design+interview+an+insider+s+guide+vol.1+%2Caps%2C478&sr=8-1&linkCode=ll2&tag=vishweshshind-21&linkId=997e6410c77439e1f5a06c5002bad6f9&ref_=as_li_ss_tl",
    "title": "System Design Interview - Vol. 1",
    "image": "https://m.media-amazon.com/images/I/4102DJpVqDL.jpg"
  },
  {
    "url": "https://www.amazon.in/Grokking-Algorithms-Second-Aditya-Bhargava-ebook/dp/B0CW1G5D2N?crid=2UOTO6YMKB9AW&dib=eyJ2IjoiMSJ9.PT5VeW2YmwF4GNyFq3jlc6ucAkwAI14M84ui6q447ZJqIiv4rK9Hzb8PTpPl_vNkMvKryp8fqAx59NGSoA51dleod4nf6e3E9OvvYRMbj2YPtpZLQi4syV6jji6cHFPyAjM_vUR9OHk8O5EtaNdODc3Y3KBGhbkNTafY41rY_PfX5-yu4sJtrtZLhBCxx9qPbAr0gQORGcNldL2ml2r17mQ76lnmdpCSm-Hlls4rgu4.hxpwR3R2LEtqDa3s9sRNxwNywGkPtFqv3G_6O5SVuqE&dib_tag=se&keywords=Grokking+Algorithms+%282nd+Ed.%29&qid=1783942969&sprefix=cracking+the+coding+interview+6th+ed.+%2Caps%2C530&sr=8-2&linkCode=ll2&tag=vishweshshind-21&linkId=929fdca4debd95da40486dd99966854b&ref_=as_li_ss_tl",
    "title": "Grokking Algorithms, 2nd Edition",
    "image": "https://m.media-amazon.com/images/I/510s2sOUoeL.jpg"
  },
  {
    "url": "https://www.amazon.in/Cracking-Coding-Interview-Programing-Questions/dp/0984782850?crid=8VLKVOHGNJCH&dib=eyJ2IjoiMSJ9.npU4ArwQqCQlIv2z6tJWh3PBsvtoO3SlLxxRCWQM55u0wDoGoO15MaD_Sw8bPLrI6pASceVQLk55rLXdhPd6vclF0Ty324iCNuVKxN93B6vXRPgADroBm0Ab8VIvHLIIT9I9b-WN0FY06rQqpKZSPCgJLLi4z158SUMVFWaAQv0CyR6Nf4scwaYHSo-ZCjGdBE0oQcFhI9tWAN30eTwq4bSlxYhG6N3jzH4jSv_EVjM.3ucO1jA3CwE3OZkxxsKhEGbAZqchM00xysRXX70v-zs&dib_tag=se&keywords=Cracking+the+Coding+Interview+%286th+Ed.%29&qid=1783942946&sprefix=grokking+algorithms+bookcracking+the+coding+interview+6th+ed.+%2Caps%2C475&sr=8-1&linkCode=ll2&tag=vishweshshind-21&linkId=6c257f993d2cf54bd195048782127ed1&ref_=as_li_ss_tl",
    "title": "Cracking the Coding Interview",
    "image": "https://m.media-amazon.com/images/I/410hiaPGyCL.jpg"
  },
  {
    "url": "https://www.amazon.in/Designing-Distributed-Systems-Paradigms-Kubernetes/dp/935542499X?crid=196OZ9F8BD2XF&dib=eyJ2IjoiMSJ9.GdNLA7ckLiRVvXEtKws-Y_WhdOwJPWMv98QuYsLE4crVWm1LkMf4PaqqjRmGmdhYn4AkZdZhOrxDbhAU_1Xh0ovK3A2ic3f-H8ZwDSSGsIFeHZgt1to1ybww7VvTjxlJGIC6BGLf7UZiHAn_BohWbvyO6lO_vdsXVUF01oLdCXR0OttIz7mp1a2zUKYjNCL3UstZk5LMq_8Zep_EsRjkb_8E1jroZwuqmPBO6pK5LDo.YQHc9T2y_D_K89Gh64ipO7J9feDdRRNVU4LdunA8qUM&dib_tag=se&keywords=system+design+book&qid=1783940530&refinements=p_72%3A1318476031&rnid=1318475031&sprefix=system+design+boo%2Caps%2C393&sr=8-15&linkCode=ll2&tag=vishweshshind-21&linkId=4dbccfaef2ae96973480525bd6f6d00a&ref_=as_li_ss_tl",
    "title": "Designing Distributed Systems",
    "image": "https://m.media-amazon.com/images/I/41b1sCbB66L.jpg"
  }
];

export default function RecommendedResource({ className }) {
  const [product, setProduct] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Pick a random product
    const randomProduct = amazonProducts[Math.floor(Math.random() * amazonProducts.length)];
    setProduct(randomProduct);
    
    // Simulate AdSense delay before showing the ad
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!product || dismissed || !visible) return null;

  return (
    <div 
      className={`recommended-resource-block ${className || ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderRadius: '8px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        width: '100%',
        maxWidth: '800px',
        margin: '20px auto',
        overflow: 'hidden',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* Ad Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfdfd', padding: '6px 12px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
          <span>Ad</span>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Close ad"
        >
          <FaTimes size={14} />
        </button>
      </div>

      {/* Ad Content */}
      <a 
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', padding: '16px', gap: '16px', textDecoration: 'none', color: 'inherit', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <div style={{ flexShrink: 0, width: '80px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
          <img 
            src={product.image} 
            alt={product.title} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f1111', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
            {product.title}
          </div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#007185', fontSize: '13px', fontWeight: '500' }}>
            Shop now on Amazon <FaExternalLinkAlt size={10} />
          </div>
        </div>
      </a>
    </div>
  );
}
