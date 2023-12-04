import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import '../assets/style/Search.css';
import foodsTemplate from '../assets/foodsTemplate';

export default function Search() {
	const [foodsSelected, setFoodsSelected] = useState([]);
	const navigate = useNavigate();
	const { isAuthenticated, userId, userName, logout } = useAuth();

  useEffect(() => {
    console.log('ログイン情報', isAuthenticated, userId, userName);
    // console.log('foodsTemplate', foodsTemplate);
  }, []);

  useEffect(() => {
    const initialFoods = foodsTemplate.flatMap((foodObj) => {
      const category = Object.keys(foodObj)[0];
      const items = foodObj[category].map((item) => ({
        category,
        name: item,
        quantity: 0,
        unit: '個', // または初期単位を設定
      }));
      return items;
    });

    setFoodsSelected(initialFoods);
  }, []);

  const handleQuantityChange = (item, e) => {
    const updatedFoods = foodsSelected.map((food) => {
      if (food.name === item) {
        return { ...food, quantity: parseInt(e.target.value) };
      }
      return food;
    });
    // console.log('updatedFoods', updatedFoods);
    setFoodsSelected(updatedFoods);
  };

  const handleUnitChange = (item, e) => {
    const updatedFoods = foodsSelected.map((food) => {
      if (food.name === item) {
        return { ...food, unit: e.target.value };
      }
      return food;
    });
    console.log('updatedFoods', updatedFoods);
    setFoodsSelected(updatedFoods);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //送信用のデータを作る
    const foodsForSend = foodsSelected
      .filter((obj) => obj.quantity > 0)
      .map((food) => {
        return {
          shopping: food.name,
          quantity: food.quantity,
          unit: food.unit,
        };
      });

		try {
			// const url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL || "https://yaoya-test2.onrender.com";
			let url;
			if (process.env.NODE_ENV === 'development') {
				url = import.meta.env.VITE_DEVELOPMENT_BACKEND_URL;
			} else {
				url = 'https://yaoya-test2.onrender.com';
			}
			const response = await fetch(url + `/api/customers/${userId}/shopping_list`, {
				method: 'POST',
				credentials: 'include', // クロスオリジンリクエストでのクッキー送信を許可
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(foodsForSend),
			});

			if (response.ok) {
				console.log('post_ok', response);
				alert('登録が完了しました');
				navigate(`/result/store`);
			} else {
				console.log('post_ng', response);
				alert('登録に失敗しました');
				logout();
			}
		} catch (error) {
			console.log('error', error);
			alert('登録に失敗しました');
			logout();
		}
	};

  const handleSubmitTest = (e) => {
    e.preventDefault();

    //送信用のデータを作る
    const foodsForSend = foodsSelected
      .filter((obj) => obj.quantity > 0)
      .map((food) => {
        return {
          shopping: food.name,
          quantity: food.quantity,
          unit: food.unit,
        };
      });
    console.log('送信用データ', foodsForSend);
  };

  const makeCategoryBoxes = () => {
    const result = foodsTemplate.map((foodObj, idx) => {
      const category = Object.keys(foodObj)[0];
      const items = Object.values(foodObj)[0];
      return (
        <div className="category_box">
          <div className="category_name">{category}</div>

          {items.map((item) => {
            return (
              <div className="item_box">
                <p className="item_name">{item}</p>
                <div className="select_box">
                  <select onChange={(e) => handleQuantityChange(item, e)}>
                    {[...Array(10)]
                      .map((_, i) => i)
                      .map((i) => (
                        <option>{i}</option>
                      ))}
                  </select>
                  <select onChange={(e) => handleUnitChange(item, e)}>
                    <option>個</option>
                    <option>1/2個</option>
                    <option>パック</option>
                    <option>本</option>
                    <option>1/２本</option>
                    <option>瓶</option>
                    <option>匹</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
    return result;
  };

  return (
    <div className="search-container">
      <div className="page-title">SEARCH</div>
      <div className="main-container">
        <h1 className="main-title">購入したい商品を選んでください</h1>
        <div className="category_container">{makeCategoryBoxes()}</div>
        <button className="search-button" onClick={handleSubmit}>
          買い物リストに登録
        </button>
      </div>
    </div>
  );
}
