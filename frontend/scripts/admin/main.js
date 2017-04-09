'use strict';


/**
 * Заменяет индексы в именах инпутов ([0]) на соответствующие порядковые номера
 * И выставляет значение индекса полю с классом .weight-field, если оно есть
 * @param $blocks
 */
function updateFieldNames($blocks) {
  $blocks.each(function (i) {
    var $inputs = $(this).find('input, select');
    $inputs.each(function () {
      var $this = $(this),
        name = $this.attr('name'),
        newName = name.replace(/\[(\d)\]/, '[' + i + ']');
      $this.attr('name', newName);
      if ($this.hasClass('weight-field')) {
        $this.val(i);
      }
    });

  });
}

function sortableContainer($container, itemSelector, handleSelector, updateCallback, options) {
  $container.sortable($.extend(
    {
      forcePlaceholderSize: true,
      forceHelperSize: true,
      items: itemSelector,
      handle: handleSelector ? handleSelector : itemSelector,
      //helper: sortableTableFix,
      update: updateCallback ? updateCallback : function (event, ui) {

      }
    }), options || {});
}

var sortableTableFix = function (e, ui) {
  ui.children().each(function () {
    $(this).width($(this).width());
  });
  return ui;
};

function entityRelations($form, containerSelector, templateSelector) {
  var
    $container = $form.find(containerSelector),
    $itemsContainer = $container.find('.relations-container'),
    $addBtn = $container.find('.relation-add-btn'),
    $template = $container.find(templateSelector);
  $form.on('submit', function (e) {
    updateFieldNames($itemsContainer.find('.related-entity-container'));
  });
  $itemsContainer.on('click', '.relation-weight-handler', function (e) {
    e.preventDefault();
  });

  sortableContainer($itemsContainer, '.related-entity-container', '.relation-weight-handler', false, {
    axis: 'y'
  });
  $addBtn.on('click', function (e) {
    e.preventDefault();
    addNewRelatedEntity();
  });

  $itemsContainer.on('click', '.relation-remove-btn', function (e) {
    e.preventDefault();
    var $row = $(this).closest('.related-entity-container');
    $row.slideUp();
    $row.find('.removed-field').val(1);
    $row.find('input').removeAttr('required');
  });

  function addNewRelatedEntity() {
    var $tmpl = $($template.html());
    $tmpl.find('.id-field').val('');
    $tmpl.find('.related-id-field').val('');
    $tmpl.hide();
    $itemsContainer.append($tmpl);
    $tmpl.slideDown();
  }
}

function initGalleryForm() {
  var $form = $('.gallery-form'),
    $images = $form.find('div.thumbnails'),
    index = $form.find('.thumbnail').length,
    addUrl = '/admin.php/gallery/add-image',
    deleteUrl = '/admin.php/gallery/remove-image',
    sortUrl = '/admin.php/gallery/sort-image',
    $addBtn = $form.find('.add-gallery-images'),
    maxImages = $form.data('max-images');
  $addBtn.fileupload({
    dataType: 'json',
    start: function (e, data) {
      $addBtn.addClass('loading disabled');
    },
    done: function (e, data) {
      var files = data.result;
      if ($form.find('div.thumbnails .thumbnail').length >= maxImages) {
        $addBtn.hide();
        return;
      }
      for (var i in files) {
        index++;
        var $html = $(files[i].html);
        $html.find('input.image-weight-field').val(index);
        $images.append($html);
      }
      $addBtn.removeClass('disabled');
    }
  });

  $images.on('click', '.delete-image', function (e) {
    e.preventDefault();
    var $btn = $(this),
      $container = $btn.closest('.gallery-image');
    $container.fadeOut(200, function () {
      $container.remove();
    });
    if (!$btn.data('id')) {
      return;
    }
    $.post(
      deleteUrl,
      {id: $btn.data('id')},
      function () {

      }
    );
  });

  $images.sortable(
    {
      forcePlaceholderSize: true,
      forceHelperSize: true,
      items: $(this).data('sortable-item-selector'),
      update: function (event, ui) {
        var serialized = $images.sortable('serialize');
        $images.find('.thumbnail').each(function (i) {
          $(this).find('input.image-weight-field').val(i);
        });
        $.ajax({
          'url': sortUrl,
          'type': 'post',
          'data': serialized,
          'success': function (data) {
          },
          'error': function (request, status, error) {
            alert('Не удалось отсортировать элементы');
          }
        });
      }
    });

  $form.on('submit', function () {
    $form.find('.thumbnails .thumbnail').each(function (i, e) {
      $(this).find('.image-position-field').val(i).attr('name', 'GalleryImages[' + i + '][position]');
      $(this).find('.image-title-field').attr('name', 'GalleryImages[' + i + '][title]');
      $(this).find('.image-comment-field').attr('name', 'GalleryImages[' + i + '][description]');
      $(this).find('.image-url-field').attr('name', 'GalleryImages[' + i + '][url]');
      $(this).find('.image-id-field').attr('name', 'GalleryImages[' + i + '][id]');
    });
  });


}

$(function () {
  if ($('.gallery-form').length) {
    initGalleryForm();
  }
});
