var app = app || {};
    app.utils = {
        loadTemplate: function(views, callback) {

            var deferreds = [];

            $.each(views, function(index, view) {
                if (app[view]) {
                    deferreds.push($.get('tpl/' + view + '.html', function(data) {
                        app[view].prototype.template = _.template(data);
                    }));
                } else {
                    alert(view + " not found");
                }
            });

            $.when.apply(null, deferreds).done(callback);
        },
        uploadFile: function (file, callbackSuccess) {
            var self = this;
            var data = new FormData();
            data.append('file', file);
            $.ajax({
                url: 'api/upload.php',
                type: 'POST',
                data: data,
                processData: false,
                cache: false,
                contentType: false
            })
            .done(function () {
                console.log(file.name + " uploaded successfully");
                callbackSuccess();
            })
            .fail(function () {
                self.showAlert('Error!', 'An error occurred while uploading ' + file.name, 'alert-error');
            });
        }
    }