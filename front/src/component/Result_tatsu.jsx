import { Link } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../assets/style/Result.css';
import storeImg from '../assets/image/store.jpg';
import shoppingImg from '../assets/image/shopping.jpg';

export default function Result() {
  const [storeProduct, setStoreProduct] = useState([]);
  const [checkBoxes, setCheckBoxes] = useState({});
  const { isAuthenticated, userId, userName, logout } = useAuth();

  const fetchData = async () => {
    try {
      // const url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL || "https://yaoya-test2.onrender.com";
      let url;
      if (process.env.NODE_ENV === 'development') {
        url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL;
      } else {
        url = 'https://yaoya-test2.onrender.com';
      }
      console.log('userId', userId);
      console.log('url', url);
      const response = await fetch(url + `/api/customers/${userId}/result/shopping`, { credentials: 'include' });
      const data = await response.json();

      if (response.ok) {
        console.log('post_ok', response, data);
        setStoreProduct(data);
      } else {
        console.log('post_ng', response);
        logout();
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  // 初回レンダリング時に以下を実行
  useEffect(() => {
    // GETリクエストで全てのshopping_listのデータを取得
    fetchData();
    // console.log('storeProduct', storeProduct);

    const initialCheckboxes = {};
    storeProduct.forEach((el) => {
      initialCheckboxes[`checkBox${el.id}`] = checkBoxes[`checkBox${el.id}`] || false;
    });
    setCheckBoxes(initialCheckboxes);
    console.log('initialCheckboxes', initialCheckboxes);
    product();
  }, []);

  // チェックボックスの変更が有った時のハンドラー
  const handleCheckBoxChange = (checkBoxName) => {
    // チェックボックスがオンのものをCheckBoxesのvalueをtrueにする
    setCheckBoxes((el) => ({
      ...el,
      [checkBoxName]: true,
    }));
  };

  // 買い物リストの商品のレンダリング
  const product = () => {
    return storeProduct
      .sort((a, b) => a.id - b.id)
      .map((el, index) => {
        return (
          <div className="shopping-label" key={index}>
            <label key={`item-${index}`}>
              {!el.flag && <input type="checkbox" className="shopping-checkbox" onChange={() => handleCheckBoxChange(`checkBox${el.id}`)} />}
              <span className="bold-span">{el.productName}</span> ({el.piece}) [{el.unit}]
            </label>
            {el.flag && <span className="grey-span">購入済み</span>}
          </div>
        );
      });
  };

  // ショップの提案のストアのレンダリング
  const store = useMemo(() => {
    const storeFlagFalseArray = storeProduct.filter((el) => !el.flag); // flagがtrueのオブジェクトは取り除く
    const storeArray = storeFlagFalseArray.map((el) => {
      return JSON.stringify({ storeId: el.storeId, storeName: el.storeName });
    });
    const uniqStoreArray = Array.from(new Set([...storeArray])).map((el) => JSON.parse(el));

    return uniqStoreArray.map((el, index) => {
      return (
        <React.Fragment key={index}>
          <Link to={`/result/store/${el.storeId}`} state={{ storeName: el.storeName }} className="Link">
            {el.storeName}
          </Link>
        </React.Fragment>
      );
    });
  }, [storeProduct]);

  // 選択した商品を購入済みに変更するボタンをクリックした時のハンドラー
  const handleFlagChangeClick = async () => {
    const checkedCheckboxes = Object.keys(checkBoxes).filter((el) => checkBoxes[el]);

    // console.log('ボタン押したあと', checkBoxes);
    const idArr = checkedCheckboxes.map((el) => el.split('x')[1]); // PATCHで投げるbody
    // console.log('フロントエンド側', idArr);

    // const url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL || 'https://yaoya-test2.onrender.com';
    let url;
    if (process.env.NODE_ENV === 'development') {
      url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL;
    } else {
      url = 'https://yaoya-test2.onrender.com';
    }
    const response = await fetch(url + `/api/udate_shopping_status/${userId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idArr),
    });

    if (response.ok) {
      console.log('patch成功');
      fetchData();
    } else {
      console.log('patch失敗');
      logout();
    }

    // [1,2,3]
    // console.log('Checked Checkboxes:', idArr);

    // try {
    //   const response = await axios.patch('', {
    //     data: idArr
    //   });
    //   setStoreProduct(response.data);
    //   console.log('PATCHリクエストが成功しました。');
    // } catch (error) {
    //   console.error('PATCHリクエストでエラーが発生しました。', error);
    // }

    // 返ってきた配列をstoreProductに格納する => 再レンダリング
    // const arr = [
    // 	{
    // 		id: 1,
    // 		storeId: 1,
    // 		productName: 'ヨーグルト',
    // 		piece: 5,
    // 		unit: '個',
    // 		flag: false,
    // 		storeName: 'プライムツリー赤池',
    // 	},
    // 	{ id: 2, storeId: 2, productName: 'かぼちゃ', piece: 1, unit: '個', flag: true, storeName: 'ワークマン' },
    // 	{ id: 3, storeId: 3, productName: '豚肉', piece: 10, unit: '個', flag: false, storeName: 'セブンイレブン' },
    // 	{ id: 4, storeId: 3, productName: 'あじ', piece: 2, unit: '個', flag: false, storeName: 'セブンイレブン' },
    // 	{ id: 5, storeId: 3, productName: '塩', piece: 3, unit: '個', flag: false, storeName: 'セブンイレブン' },
    // ];

    // setStoreProduct(arr);
  };

  return (
    <>
      <div className="page-title">RESULT</div>
      <div className="result-container">
        <div className="shopping-list" style={{ backgroundImage: `url(${shoppingImg})` }}>
          <h1>買い物リスト</h1>
          <div className="shopping-box">{product()}</div>
          <button className="shopping-btn" onClick={handleFlagChangeClick}>
            選択した商品を購入済みに変更する
          </button>
        </div>
        <div className="store-list" style={{ backgroundImage: `url(${storeImg})` }}>
          <h1>ショップの提案</h1>
          <div className="store-box">{store}</div>
        </div>
      </div>
    </>
  );
}
