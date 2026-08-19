import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';
import { DateUtils } from '../utils/dateUtils';
import '../../styles/task-form.css';

interface TaskFormProps {
  onSubmit: (data: Partial<Task>) => void;
  onCancel: () => void;
  initialTask?: Task;
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialTask
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    priority: (initialTask?.priority || 'medium') as TaskPriority,
    deadline: initialTask?.deadline || '',
    estimatedDuration: initialTask?.estimatedDuration || 30,
    category: initialTask?.category || 'general',
    tags: initialTask?.tags || []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'estimatedDuration' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be under 200 characters';
    }

    if (formData.deadline && !DateUtils.isValidDate(formData.deadline)) {
      newErrors.deadline = 'Please enter a valid date (YYYY-MM-DD)';
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Duration must be greater than 0';
    }

    if (formData.estimatedDuration > 24 * 60) {
      newErrors.estimatedDuration = 'Duration cannot exceed 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        <div className="form-header">
          <h2>{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            className="btn-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title field */}
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What do you need to do?"
              maxLength={200}
              autoFocus
              aria-required="true"
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {/* Description field */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Priority field */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Duration field */}
            <div className="form-group">
              <label htmlFor="estimatedDuration">Estimated Duration (minutes)</label>
              <input
                id="estimatedDuration"
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="1"
                max={24 * 60}
              />
              {errors.estimatedDuration && (
                <div className="error-message">{errors.estimatedDuration}</div>
              )}
            </div>
          </div>

          {/* Deadline field */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
              {errors.deadline && <div className="error-message">{errors.deadline}</div>}
            </div>

            {/* Category field */}
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Work, Personal"
              />
            </div>
          </div>

          {/* Tags field */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input-group">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                className="btn-add-tag"
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="tags-preview">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button
                      type="button"
                      className="btn-remove-tag"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag: ${tag}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
