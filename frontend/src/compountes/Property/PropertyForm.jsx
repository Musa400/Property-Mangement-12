import React, { useState } from 'react';
import '../../styles/PropertyForm.css';

const PropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: property?.title || '',
    province: property?.province || '',
    description: property?.description || '',
    address: property?.address || '',
    type: property?.type || '',  
    size: property?.size || '',
    propertyValue: property?.propertyValue || null,
    status: property?.status || 'vacant',
    location: {
      latitude: property?.location?.latitude || '',
      longitude: property?.location?.longitude || '',
      neighborhood: property?.location?.neighborhood || '',
      city: property?.location?.city || '',
      country: property?.location?.country || ''
    },
    securityClearanceLevel: property?.securityClearanceLevel || 'restricted'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, New value: ${value}`); // Log field changes

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const propertyTypes = [
   'تجارتی', 'تاسيسات', 'للمی', 'زراعتی',
    // 'office',
    // 'warehouse',
    // 'residential',
    // 'training',
    // 'security'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان ضروری است';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'ولایت ضروری است';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'توضیحات ضروری است';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'آدرس ضروری است';
    }
    if (!formData.type || !propertyTypes.includes(formData.type)) {
      newErrors.type = 'نوع ملکیت ضروری است و باید یک نوع معتبر باشد';
    }
    if (!formData.location.latitude || !formData.location.longitude) {
      newErrors.location = 'مختصات جغرافیایی ضروری است';
    }
    if (!formData.status) {
      newErrors.status = 'وضعیت ملکیت ضروری است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Latitude:', formData.location.latitude);
    console.log('Longitude:', formData.location.longitude);

    const processedData = {
      title: formData.title.trim(),
      province: formData.province.trim(),
      description: formData.description.trim(),
      address: formData.address.trim(),
      type: formData.type,  
      size: formData.size ? Number(formData.size) : undefined,
      propertyValue: formData.propertyValue ? Number(formData.propertyValue) : null,
      status: formData.status || 'vacant',
      securityClearanceLevel: formData.securityClearanceLevel || 'restricted',
      location: {
        latitude: Number(formData.location.latitude),
        longitude: Number(formData.location.longitude),
        neighborhood: formData.location.neighborhood?.trim() || '',
        city: formData.location.city?.trim() || '',
        country: formData.location.country?.trim() || ''
      }
    };

    console.log('Submitting property data:', processedData);
    onSave(processedData);
  };

  const afghanProvinces = [
    'کابل', 'هرات', 'کندهار', 'بلخ', 'ننگرهار', 
    'بدخشان', 'بغلان', 'بامیان', 'دایکندی', 'فراه', 
    'فاریاب', 'غزني', 'غور', 'هلمند', 'جوزجان', 
    'خوست', 'کونر', 'کندوز', 'لغمان', 'لوگر', 
    'میدان وردک', 'نیمروز', 'نورستان', 'پکتیا', 
    'پکتیکا', 'پنجشیر', 'پروان', 'سمنگان', 'سرپل', 
    'تخار', 'ارزگان', 'زابل'
  ];

  return (
    <div className="property-form-container">
      <form onSubmit={handleSubmit} className="property-form">
        <h2>{property ? 'ویرایش ملکیت' : 'ثبت ملکیت جدید'}</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">عنوان ملکیت <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="عنوان ملکیت را وارد کنید"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="province">ولایت <span className="required">*</span></label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              className={errors.province ? 'input-error' : ''}
            >
              <option value="">ولایت را انتخاب کنید</option>
              {afghanProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && <span className="error-text">{errors.province}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">نوع ملکیت <span className="required">*</span></label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={errors.type ? 'input-error' : ''}
            >
              <option value="">نوع ملکیت را انتخاب کنید</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">توضیحات <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={500}
              placeholder="توضیحات ملکیت را وارد کنید"
              rows={4}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">آدرس <span className="required">*</span></label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="آدرس دقیق ملکیت"
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="size">مساحت (متر مربع)</label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="0"
              placeholder="مساحت ملکیت"
            />
          </div>
          <div className="form-group">
            <label htmlFor="propertyValue">ارزش ملکیت</label>
            <input
              type="number"
              id="propertyValue"
              name="propertyValue"
              value={formData.propertyValue || ''}
              onChange={handleChange}
              min="0"
              placeholder="ارزش ملکیت"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">وضعیت ملکیت <span className="required">*</span></label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className={errors.status ? 'input-error' : ''}
            >
              <option value="vacant">خالی</option>
              {/* <option value="occupied">اشغال شده</option> */}
              <option value="maintenance">
              د ساتنې لاندې</option>
            </select>
            {errors.status && <span className="error-text">{errors.status}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location.latitude">عرض جغرافیایی <span className="required">*</span></label>
            <input
              type="number"
              id="location.latitude"
              name="location.latitude"
              value={formData.location.latitude}
              onChange={handleChange}
              required
              step="any"
              placeholder="عرض جغرافیایی"
              className={errors.location ? 'input-error' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location.longitude">طول جغرافیایی <span className="required">*</span></label>
            <input
              type="number"
              id="location.longitude"
              name="location.longitude"
              value={formData.location.longitude}
              onChange={handleChange}
              required
              step="any"
              placeholder="طول جغرافیایی"
              className={errors.location ? 'input-error' : ''}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {property ? 'ذخیره تغییرات' : 'ثبت ملکیت'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
};




export default PropertyForm;