import React, { useEffect, useState } from 'react';
import type { Norm, WeatherNormsTableProps } from '../../types/form';
import { getWeatherNorms } from '../../utils/api';
import styles from './WeatherNormsTable.module.css';

export const WeatherNormsTable: React.FC<WeatherNormsTableProps> = ({ cropName, setHasChanges }) => {
  const [norms, setNorms] = useState<Norm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const [editingId, setEditingId] = useState<number | null>(null);
const [editedValues, setEditedValues] = useState<Partial<Norm>>({});
const [adding, setAdding] = useState(false);

const startEditing = (norm: Norm) => {
  setEditingId(norm.id);
  setEditedValues({ ...norm });
};

const handleInputChange = (field: string, value: string) => {
  setEditedValues(prev => ({
    ...prev,
    [field]: field === 'period_name' ? value : Number(value),
  }));
};

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingId(null);
      setAdding(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, []);


const handleEditKeyDown = async (e: React.KeyboardEvent, id: number) => {
  if (e.key === 'Enter') {
    try {
      const response = await fetch(`/api/v1/weather_norms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedValues)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении');
      }
  setHasChanges(true);
  setNorms(prev =>
    prev.map(norm =>
      norm.id === id && editedValues.id !== undefined
        ? { ...norm, ...(editedValues as Norm) }
        : norm
    )
  );

        setEditingId(null);
      } catch (err) {
        console.error(err);
        alert('Ошибка при обновлении нормы');
      }
    }
  };

  const [newNorm, setNewNorm] = useState({
    period_id: 0,
    days_in_period: '',
    min_temp: '',
    norm_mean_temp: '',
    norm_sum_eff_temp: '',
    norm_precipitation: '',
    period_name: ''
  });

  useEffect(() => {
    const fetchNorms = async () => {
      try {
        setLoading(true);
        const allNorms = await getWeatherNorms();
        const cropNorms = allNorms.filter(norm => norm.crop === cropName);
        setNorms(cropNorms);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить нормы');
      } finally {
        setLoading(false);
      }
    };

    fetchNorms();
  }, [cropName]);

  const sortedNorms = [...norms].sort((a, b) => a.period_id - b.period_id);
  const lastPeriodId = sortedNorms[sortedNorms.length - 1]?.period_id ?? 0;

  const handleAddClick = () => {
    const nextPeriodId = sortedNorms.length ? lastPeriodId + 1 : 1;
    setNewNorm({
      period_id: nextPeriodId,
      days_in_period: '',
      min_temp: '',
      norm_mean_temp: '',
      norm_sum_eff_temp: '',
      norm_precipitation: '',
      period_name: ''
    });
    setAdding(true);
  };

  const handleAddSubmit = async () => {
    if (
      !newNorm.days_in_period ||
      !newNorm.min_temp ||
      !newNorm.norm_mean_temp ||
      !newNorm.norm_sum_eff_temp ||
      !newNorm.norm_precipitation ||
      !newNorm.period_name
    ) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const payload = {
      period_id: newNorm.period_id,
      crop: cropName,
      days_in_period: Number(newNorm.days_in_period),
      min_temp: Number(newNorm.min_temp),
      norm_mean_temp: Number(newNorm.norm_mean_temp),
      norm_sum_eff_temp: Number(newNorm.norm_sum_eff_temp),
      norm_precipitation: Number(newNorm.norm_precipitation),
      period_name: String(newNorm.period_name)
    };

    try {
      const response = await fetch('/api/v1/weather_norms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при добавлении');
      }

      const created = await response.json(); // { message, id }

      const normWithId = {
        ...payload,
        id: created.id
      };

      setNorms(prev => [...prev, normWithId]);
      setAdding(false);
      setHasChanges(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка добавления нормы');
    }
  };


  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить эту норму?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/v1/weather_norms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении нормы');
      }
      setHasChanges(true);
      setNorms(prev => prev.filter(norm => norm.id !== id));
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить норму');
    }
  };

  const handleChange = (field: keyof typeof newNorm, value: string) => {
    setNewNorm(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubmit();
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
  <div className={styles.tableContainer}>
  <table className={styles.table}>
    <thead>
      <tr>
        <th>Период</th>
        <th>Название периода</th>
        <th>Дней в периоде</th>
        <th>Мин. температура</th>
        <th>Сред. темп</th>
        <th>Сумма эф. темп</th>
        <th>Осадки</th>
        <th>Редактировать</th>
        <th>Удалить</th>
      </tr>
    </thead>
    <tbody>
      {sortedNorms.map(norm => (
        <tr key={norm.id}>
          <td>{norm.period_id}</td>
          <td>
            {editingId === norm.id ? (
              <input
                type="text"
                value={editedValues.period_name ?? ''}
                onChange={e => handleInputChange('period_name', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.period_name
            )}
          </td>

           <td>
            {editingId === norm.id ? (
              <input
                type="number"
                value={editedValues.days_in_period}
                onChange={e => handleInputChange('days_in_period', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.days_in_period
            )}
          </td>

          <td>
            {editingId === norm.id ? (
              <input
                type="number"
                value={editedValues.min_temp}
                onChange={e => handleInputChange('min_temp', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.min_temp
            )}
          </td>
          <td>
            {editingId === norm.id ? (
              <input
                type="number"
                value={editedValues.norm_mean_temp}
                onChange={e => handleInputChange('norm_mean_temp', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.norm_mean_temp
            )}
          </td>
          <td>
            {editingId === norm.id ? (
              <input
                type="number"
                value={editedValues.norm_sum_eff_temp}
                onChange={e => handleInputChange('norm_sum_eff_temp', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.norm_sum_eff_temp
            )}
          </td>
          <td>
            {editingId === norm.id ? (
              <input
                type="number"
                value={editedValues.norm_precipitation}
                onChange={e => handleInputChange('norm_precipitation', e.target.value)}
                onKeyDown={e => handleEditKeyDown(e, norm.id)}
                className={styles.input}
              />
            ) : (
              norm.norm_precipitation
            )}
          </td>
          <td>
            <img
              src="/static/img/penEditButton.svg"
              alt="Edit"
              className={styles.icon}
              onClick={() => startEditing(norm)}
            />
          </td>
          <td>
            {norm.period_id === lastPeriodId && (
              <img
                src="/static/img/trashButton.svg"
                alt="Delete"
                className={styles.icon}
                onClick={() => handleDelete(norm.id)}
              />
            )}
          </td>
        </tr>
      ))}

      {adding && (
        <tr>
          <td>{newNorm.period_id}</td>
          <td>
            <input
              type="text"
              required
              value={newNorm.period_name ?? ''}
              onChange={e => handleChange('period_name', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="number"
              required
              value={newNorm.days_in_period}
              onChange={e => handleChange('days_in_period', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="number"
              required
              value={newNorm.min_temp}
              onChange={e => handleChange('min_temp', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="number"
              required
              value={newNorm.norm_mean_temp}
              onChange={e => handleChange('norm_mean_temp', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="number"
              required
              value={newNorm.norm_sum_eff_temp}
              onChange={e => handleChange('norm_sum_eff_temp', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td>
            <input
              type="number"
              required
              value={newNorm.norm_precipitation}
              onChange={e => handleChange('norm_precipitation', e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </td>
          <td colSpan={2}>
            <button onClick={handleAddSubmit} className={styles.buttonSave}>
              Сохранить
            </button>
          </td>
        </tr>
      )}

      {!adding && (
        <tr>
          <td colSpan={9}>
            <img
              src="/static/img/editButton.svg"
              alt="Добавить период"
              className={styles.iconAdd}
              onClick={handleAddClick}
              style={{ cursor: 'pointer' }}
            />
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  );
};
